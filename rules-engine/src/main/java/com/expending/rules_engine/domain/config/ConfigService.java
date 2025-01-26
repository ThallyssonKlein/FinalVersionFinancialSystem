package com.expending.rules_engine.domain.config;

import com.expending.rules_engine.domain.ConfigsForTransactionsBO;
import com.expending.rules_engine.domain.PairBO;
import com.expending.rules_engine.ports.outbound.database.SavedTransactionsRepository;
import com.expending.rules_engine.domain.config.bo.BetweenBO;
import com.expending.rules_engine.domain.config.bo.ConfigBO;
import com.expending.rules_engine.domain.config.bo.RuleBO;
import com.expending.rules_engine.domain.transaction.bo.TransactionBO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.lang.reflect.Field;
import java.text.SimpleDateFormat;
import java.util.*;


@Service
public class ConfigService {
    private static final SimpleDateFormat FORMATTER = new SimpleDateFormat("yyyy-MM-dd");

    @Autowired
    private SavedTransactionsRepository savedTransactionsRepository;

    public Object getFieldValue(Object obj, String fieldName) {
        try {
            Field field = obj.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            return field.get(obj);
        } catch (NoSuchFieldException | IllegalAccessException e) {
            e.printStackTrace();
            return null;
        }
    }

    public static String camelToSnake(String camelCase) {
        return camelCase.replaceAll("([a-z])([A-Z]+)", "$1_$2").toLowerCase();
    }

    private BetweenBO<?> createBetweenInstance(String type, Object value1, Object value2) {
        switch (type) {
            case "NUMBER":
                return new BetweenBO<>((Integer) value1, (Integer) value2);
            case "DATE":
                return new BetweenBO<>((Date) value1, (Date) value2);
            case "STRING":
                return new BetweenBO<>((String) value1, (String) value2);
            default:
                throw new IllegalArgumentException("Unsupported type: " + type);
        }
    }

    private boolean validateContains(RuleBO ruleBO, TransactionBO transactionBO, boolean shouldReturnConfig) {
        if (ruleBO.getProperty() != null && ruleBO.getContains() != null) {
            if (ruleBO.getContains() instanceof String) {
                if (this.getFieldValue(transactionBO, ruleBO.getProperty()).toString().contains((String) ruleBO.getContains())) {
                    shouldReturnConfig = true;
                } else {
                    shouldReturnConfig = false;
                }
            } else if (ruleBO.getContains() instanceof List) {
                List<String> containsList = (List<String>) ruleBO.getContains();
                for (String contains: containsList) {
                    if (this.getFieldValue(transactionBO, ruleBO.getProperty()).toString().contains(contains)) {
                        shouldReturnConfig = true;
                    } else {
                        shouldReturnConfig = false;
                    }
                }
            }
        }

        return shouldReturnConfig;
    }

    private boolean validateBetween(BetweenBO<?> betweenBO, RuleBO ruleBO, Object field, boolean shouldReturnConfig) {
        if (betweenBO != null) {
            switch (ruleBO.getTypeBO()) {
                case NUMBER -> {
                    if ((Integer) field > (Integer) betweenBO.getValue1()
                            && (Integer) field < (Integer) betweenBO.getValue2()) {
                        shouldReturnConfig = true;
                    } else {
                        shouldReturnConfig = false;
                    }
                }
                case DATE -> {
                    if (((Date) field).after((Date) betweenBO.getValue1())
                            && ((Date) field).before((Date) betweenBO.getValue2())) {
                        shouldReturnConfig = true;
                    } else {
                        shouldReturnConfig = false;
                    }
                }
                case STRING -> {
                    throw new IllegalArgumentException("Unsupported type: " + ruleBO.getTypeBO());
                }
            }
        }

        return shouldReturnConfig;
    }

    private boolean isConfigForThisTransaction(ConfigBO configBO, TransactionBO transactionBO) {
        boolean shouldReturnConfig = false;
        for (RuleBO ruleBO : configBO.getRuleBOS()) {
            if (configBO.getUseCalculatedBO() != null) {
                Object usedInCalculationFieldValue = this.getFieldValue(configBO.getUseCalculatedBO(), ruleBO.getUseInCalculation()) != null;
                BetweenBO<?> betweenBO = this.createBetweenInstance(ruleBO.getTypeBO().name(), ruleBO.getBetweenBO().getValue1(), ruleBO.getBetweenBO().getValue2());
                shouldReturnConfig = validateBetween(betweenBO, ruleBO, usedInCalculationFieldValue, shouldReturnConfig);
            } else {
                BetweenBO<?> betweenBO = this.createBetweenInstance(ruleBO.getTypeBO().name(), ruleBO.getBetweenBO().getValue1(), ruleBO.getBetweenBO().getValue2());
                shouldReturnConfig = validateBetween(betweenBO, ruleBO, this.getFieldValue(transactionBO, ruleBO.getProperty()), shouldReturnConfig);
            }

            shouldReturnConfig = validateContains(ruleBO, transactionBO, shouldReturnConfig);

            if (ruleBO.getEquals() != null) {
                if (this.getFieldValue(transactionBO, ruleBO.getProperty()).equals(ruleBO.getEquals())) {
                    shouldReturnConfig = true;
                } else {
                    shouldReturnConfig = false;
                }
            }

            if (ruleBO.getFrequencyBO() != null) {
                List<TransactionBO> transactionsFrequency = this.savedTransactionsRepository.findTransactionsInLastXFrequencyX(ruleBO.getFrequencyBO());
                boolean isThisConfigCorrectForThisTransactionFrequency = false;
                int searchedNumbers = 0;
                for (TransactionBO transactionBOFrequency : transactionsFrequency) {
                    if (ruleBO.getFrequencyBO().getTargetNumber() > 0 && searchedNumbers == ruleBO.getFrequencyBO().getTargetNumber()) {
                        isThisConfigCorrectForThisTransactionFrequency = this.isConfigForThisTransaction(configBO, transactionBOFrequency);
                    } else if (ruleBO.getFrequencyBO().getTargetNumber() == 0) {
                        isThisConfigCorrectForThisTransactionFrequency = this.isConfigForThisTransaction(configBO, transactionBOFrequency);
                        break;
                    }

                    searchedNumbers += 1;
                }
                if (isThisConfigCorrectForThisTransactionFrequency) {
                    shouldReturnConfig = true;
                } else {
                    shouldReturnConfig = false;
                }
            }
        }

        return shouldReturnConfig;
    }

    public ConfigsForTransactionsBO determineConfigsForTransactions(ConfigBO defaultConfigBO, List<ConfigBO> configBOS,
                                                                    List<TransactionBO> transactionBOS,
                                                                    List<Map<String, List<TransactionBO>>> transactionsGroupedByDateBO) {
        Map<String, ConfigBO> configMap = new HashMap<>();
        List<PairBO> pairBOS = new ArrayList<>();
        for (TransactionBO transactionBO : transactionBOS) {
            boolean puttedInTheMapOrPair = false;
            for (ConfigBO configBO : configBOS) {
                boolean isThisConfigCorrectForThisTransaction = this.isConfigForThisTransaction(configBO, transactionBO);
                if (isThisConfigCorrectForThisTransaction) {
                    if (configBO.getFindPairBO() != null) {
                        Date currentDate = transactionBO.getDate();
                        if (transactionsGroupedByDateBO.getDate().equals(currentDate)) {
                            for (TransactionBO pair : transactionsGroupedByDateBO.getTransactions()) {
                                boolean isThisConfigCorrectForThisTransactionPair = this.isConfigForThisTransaction(configBO, pair);
                                if (isThisConfigCorrectForThisTransactionPair) {
                                    pairBOS.add(new PairBO(
                                            configBO.getFindPairBO().getPairName(),
                                            configBO,
                                            Arrays.asList(transactionBO, pair)
                                    ));
                                    puttedInTheMapOrPair = true;
                                }
                            }
                        }
                    } else {
                        configMap.put(transactionBO.getId(), configBO);
                        puttedInTheMapOrPair = true;
                    }
                }
            }

            if (!puttedInTheMapOrPair) {
                configMap.put(transactionBO.getId(), defaultConfigBO);
            }
        }

        return new ConfigsForTransactionsBO(
            configMap,
                pairBOS
        );
    }
}
