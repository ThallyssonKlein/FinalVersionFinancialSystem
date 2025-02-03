package com.expending.backend.domain.config;

import com.expending.backend.domain.ConfigsForTransactionsBO;
import com.expending.backend.domain.PairBO;
import com.expending.backend.domain.config.bo.TypeBO;
import com.expending.backend.domain.config.bo.BetweenBO;
import com.expending.backend.domain.config.bo.ConfigBO;
import com.expending.backend.domain.config.bo.RuleBO;
import com.expending.backend.domain.transaction.bo.TransactionBO;
import org.springframework.stereotype.Service;

import java.lang.reflect.Field;
import java.text.SimpleDateFormat;
import java.util.*;


@Service
public class ConfigService {
    private static final SimpleDateFormat FORMATTER = new SimpleDateFormat("yyyy-MM-dd");

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

    private boolean validateContains(Object contains, Object property) {
        boolean shouldReturnConfig = false;

        if (!(property instanceof String)) {
            return false;
        }

        if (contains instanceof String) {
            shouldReturnConfig = ((String) property).contains((String) contains);
        } else if (contains instanceof List<?> list) {
            boolean containsAll = true;
            if (!list.isEmpty() && list.getFirst() instanceof String) {
                if (!((String) property).contains((String) list.getFirst())) {
                    containsAll = false;
                }
            }
            shouldReturnConfig = containsAll;
        }

        return shouldReturnConfig;
    }

    private boolean validateBetween(BetweenBO<?> betweenBO, TypeBO typeBO, Object field) {
        boolean shouldReturnConfig = false;

        if (betweenBO != null) {
            switch (typeBO) {
                case NUMBER -> {
                    if ((Integer) field > (Integer) betweenBO.getValue1()
                            && (Integer) field < (Integer) betweenBO.getValue2()) {
                        shouldReturnConfig = true;
                    }
                }
                case DATE -> {
                    if (((Date) field).after((Date) betweenBO.getValue1())
                            && ((Date) field).before((Date) betweenBO.getValue2())) {
                        shouldReturnConfig = true;
                    }
                }
                case STRING -> {
                    throw new IllegalArgumentException("Unsupported type: " + typeBO);
                }
            }
        }

        return shouldReturnConfig;
    }

    private boolean isConfigForThisTransaction(ConfigBO configBO, TransactionBO transactionBO) {
        boolean allTrue = true;
        for (RuleBO ruleBO : configBO.getRuleBOS()) {
            Object property;
            if (ruleBO.getUseCalculated() != null) {
                property = this.getFieldValue(transactionBO, ruleBO.getUseCalculated());
            } else {
                property = this.getFieldValue(transactionBO, ruleBO.getProperty());
            }

            if (!validateBetween(ruleBO.getBetweenBO(), ruleBO.getTypeBO(), property)) {
                allTrue = false;
            }
            if (!validateContains(ruleBO, property)) {
                allTrue = false;
            }

            if (ruleBO.getEquals() != null) {
                if (!property.equals(ruleBO.getEquals())) {
                    allTrue = false;
                }
            }
        }

        return allTrue;
    }

    private PairBO findConfigPair(TransactionBO transactionBO, Map<String, List<TransactionBO>> transactionsGroupedByDateBO, ConfigBO configBO) {
        Date currentDate = transactionBO.getDate();
        List<TransactionBO> transactionBOS1 = transactionsGroupedByDateBO.get(FORMATTER.format(currentDate));
        if (transactionBOS1 != null) {
            for (TransactionBO pair : transactionBOS1) {
                boolean isThisConfigCorrectForThisTransactionPair = this.isConfigForThisTransaction(configBO, pair);
                if (isThisConfigCorrectForThisTransactionPair) {
                    return new PairBO(
                            configBO.getFindPairBO().getPairName(),
                            configBO,
                            Arrays.asList(transactionBO, pair)
                    );
                }
            }
        }

        return null;
    }

    public ConfigsForTransactionsBO determineConfigsForTransactions(ConfigBO defaultConfigBO, List<ConfigBO> configBOS,
                                                                    List<TransactionBO> transactionBOS,
                                                                    Map<String, List<TransactionBO>> transactionsGroupedByDateBO) {
        Map<String, ConfigBO> configMap = new HashMap<>();
        List<PairBO> pairBOS = new ArrayList<>();

        for (TransactionBO transactionBO : transactionBOS) {
            List<ConfigBO> correctConfigs = new ArrayList<>();
            for (ConfigBO configBO : configBOS) {
                boolean isThisConfigCorrectForThisTransaction = this.isConfigForThisTransaction(configBO, transactionBO);

                if (isThisConfigCorrectForThisTransaction) {
                    correctConfigs.add(configBO);
                }
            }

            Optional<ConfigBO> correctConfig;
            if (correctConfigs.size() > 1) {
                correctConfig = correctConfigs.stream().reduce((first, second) -> {
                    if (first.getRuleBOS().size() > second.getRuleBOS().size()) {
                        return first;
                    } else {
                        return second;
                    }
                });
            } else {
                correctConfig = correctConfigs.stream().findFirst();
            }

            if (correctConfig.isEmpty()) {
                configMap.put(transactionBO.getId(), defaultConfigBO);
            } else {
                if (correctConfig.get().getFindPairBO() != null) {
                    PairBO pairBO = this.findConfigPair(transactionBO, transactionsGroupedByDateBO, correctConfig.get());
                    if (pairBO != null) {
                        pairBOS.add(pairBO);
                    } else {
                        configMap.put(transactionBO.getId(), defaultConfigBO);
                    }
                } else {
                    configMap.put(transactionBO.getId(), correctConfig.get());
                }
            }
        }

        return new ConfigsForTransactionsBO(
            configMap,
            pairBOS
        );
    }
}
