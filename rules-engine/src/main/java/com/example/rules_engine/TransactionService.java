package com.example.rules_engine;

import com.example.rules_engine.config.Between;
import com.example.rules_engine.config.Config;
import com.example.rules_engine.config.Rule;
import com.example.rules_engine.transaction.Transaction;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.lang.reflect.Field;
import java.text.SimpleDateFormat;
import java.util.*;

@Getter
@Setter
@AllArgsConstructor
class BeteweenResult {
    private boolean shouldReturnConfig;
    private String queryToSearchTheFrequencyNumber;
}

@Getter
@Setter
@AllArgsConstructor
class ContainsResult {
    private boolean shouldReturnConfig;
    private String queryToSearchTheFrequencyNumber;
}

@RequiredArgsConstructor
public class TransactionService {
    private static final SimpleDateFormat FORMATTER = new SimpleDateFormat("yyyy-MM-dd");
    private final TransactionRepository transactionRepository;

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

    private Between<?> createBetweenInstance(String type, Object value1, Object value2) {
        switch (type) {
            case "NUMBER":
                return new Between<>((Integer) value1, (Integer) value2);
            case "DATE":
                return new Between<>((Date) value1, (Date) value2);
            case "STRING":
                return new Between<>((String) value1, (String) value2);
            default:
                throw new IllegalArgumentException("Unsupported type: " + type);
        }
    }

    private ContainsResult validateContains(Rule rule, Transaction transaction, boolean shouldReturnConfig, String queryToSearchTheFrequencyNumber) {
        if (rule.getProperty() != null && rule.getContains() != null) {
            if (rule.getContains() instanceof  String) {
                if (this.getFieldValue(transaction, rule.getProperty()).toString().contains((String) rule.getContains())) {
                    shouldReturnConfig = true;
                    queryToSearchTheFrequencyNumber += TransactionService.camelToSnake(rule.getProperty()) + " LIKE '%" + rule.getContains() + "%'";
                } else {
                    shouldReturnConfig = false;
                }
            } else if (rule.getContains() instanceof List) {
                List<String> containsList = (List<String>) rule.getContains();
                for (String contains: containsList) {
                    if (this.getFieldValue(transaction, rule.getProperty()).toString().contains(contains)) {
                        shouldReturnConfig = true;
                        queryToSearchTheFrequencyNumber += TransactionService.camelToSnake(rule.getProperty()) + " LIKE '%" + contains + "%' AND";
                    } else {
                        shouldReturnConfig = false;
                    }
                }
            }
        }

        return new ContainsResult(shouldReturnConfig, queryToSearchTheFrequencyNumber);
    }

    private BeteweenResult validateBetween(Between<?> between, Rule rule, Object field, boolean shouldReturnConfig, boolean usingCalculatedField, String queryToSearchTheFrequencyNumber) {
        if (between != null) {
            switch (rule.getType()) {
                case NUMBER -> {
                    if ((Integer) field > (Integer) between.getValue1()
                            && (Integer) field < (Integer) between.getValue2()) {
                        shouldReturnConfig = true;
                        if (!usingCalculatedField) {
                            queryToSearchTheFrequencyNumber += TransactionService.camelToSnake(rule.getProperty()) + " BETWEEN " + between.getValue1() + " AND " + between.getValue2();
                        }
                    } else {
                        shouldReturnConfig = false;
                    }
                }
                case DATE -> {
                    if (((Date) field).after((Date) between.getValue1())
                            && ((Date) field).before((Date) between.getValue2())) {
                        shouldReturnConfig = true;
                        if (!usingCalculatedField) {
                            queryToSearchTheFrequencyNumber += TransactionService.camelToSnake(rule.getProperty()) + " BETWEEN " + FORMATTER.format(between.getValue1()) + " AND " + FORMATTER.format(between.getValue2());
                        }
                    } else {
                        shouldReturnConfig = false;
                    }
                }
                case STRING -> {
                    throw new IllegalArgumentException("Unsupported type: " + rule.getType());
                }
            }
        }

        return new BeteweenResult(shouldReturnConfig, queryToSearchTheFrequencyNumber);
    }

    private boolean isConfigForThisTransaction(Config config, Transaction transaction) {
        String queryToSearchTheFrequencyNumber = "SELECT * FROM transactions WHERE ";

        boolean shouldReturnConfig = false;
        for (Rule rule : config.getRules()) {
            if (config.getUseInCalculation() != null) {
                Object usedInCalculationFieldValue = this.getFieldValue(config.getUseInCalculation(), rule.getUseInCalculation()) != null;
                Between<?> between = this.createBetweenInstance(rule.getType().name(), rule.getBetween().getValue1(), rule.getBetween().getValue2());
                BeteweenResult betweenResult = validateBetween(between, rule, usedInCalculationFieldValue, shouldReturnConfig, true, queryToSearchTheFrequencyNumber);
                shouldReturnConfig = betweenResult.isShouldReturnConfig();
                queryToSearchTheFrequencyNumber = betweenResult.getQueryToSearchTheFrequencyNumber();
            } else {
                Between<?> between = this.createBetweenInstance(rule.getType().name(), rule.getBetween().getValue1(), rule.getBetween().getValue2());
                BeteweenResult beteweenResult = validateBetween(between, rule, this.getFieldValue(transaction, rule.getProperty()), shouldReturnConfig, false, queryToSearchTheFrequencyNumber);
                shouldReturnConfig = beteweenResult.isShouldReturnConfig();
                queryToSearchTheFrequencyNumber = beteweenResult.getQueryToSearchTheFrequencyNumber();
            }

            ContainsResult containsResult = validateContains(rule, transaction, shouldReturnConfig, queryToSearchTheFrequencyNumber);
            shouldReturnConfig = containsResult.isShouldReturnConfig();
            queryToSearchTheFrequencyNumber = containsResult.getQueryToSearchTheFrequencyNumber();

            if (rule.getEquals() != null) {
                if (this.getFieldValue(transaction, rule.getProperty()).equals(rule.getEquals())) {
                    shouldReturnConfig = true;
                } else {
                    shouldReturnConfig = false;
                }
            }

            if (rule.getFrequency() != null) {
                List<Transaction> transactionsFrequency = this.transactionRepository.findTransactionsInLastXFrequencyX(rule.getFrequency());
                boolean isThisConfigCorrectForThisTransactionFrequency = false;
                int searchedNumbers = 0;
                for (Transaction transactionFrequency : transactionsFrequency) {
                    if (rule.getFrequency().getNumber() > 0 && searchedNumbers == rule.getFrequency().getNumber()) {
                        isThisConfigCorrectForThisTransactionFrequency = this.isConfigForThisTransaction(config, transactionFrequency);
                    } else if (rule.getFrequency().getNumber() == 0) {
                        isThisConfigCorrectForThisTransactionFrequency = this.isConfigForThisTransaction(config, transactionFrequency);
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

    public ConfigsForTransactionsReturn getConfigsForTransactions(Config defaultConfig, List<Config> configs,
                                                                  List<Transaction> transactions,
                                                                  TransactionsGroupedByDate transactionsGroupedByDate) {
        Map<String, Config> configMap = new HashMap<>();
        List<Pair> pairs = new ArrayList<>();
        for (Transaction transaction: transactions) {
            boolean puttedInTheMapOrPair = false;
            for (Config config: configs) {
                boolean isThisConfigCorrectForThisTransaction = this.isConfigForThisTransaction(config, transaction);
                if (isThisConfigCorrectForThisTransaction) {
                    if (config.getFindPair() != null) {
                        Date currentDate = transaction.getDate();
                        if (transactionsGroupedByDate.getDates().contains(TransactionService.FORMATTER.format(currentDate))) {
                            for (Transaction pair : transactionsGroupedByDate.getTransactions()) {
                                boolean isThisConfigCorrectForThisTransactionPair = this.isConfigForThisTransaction(config, pair);
                                if (isThisConfigCorrectForThisTransactionPair) {
                                    pairs.add(new Pair(
                                            config.getFindPair().getPairName(),
                                            config.getId(),
                                            new String[]{transaction.getId(), pair.getId()}
                                    ));
                                    puttedInTheMapOrPair = true;
                                }
                            }
                        }
                    } else {
                        configMap.put(transaction.getId(), config);
                        puttedInTheMapOrPair = true;
                    }
                }
            }

            if (!puttedInTheMapOrPair) {
                configMap.put(transaction.getId(), defaultConfig);
            }
        }

        return new ConfigsForTransactionsReturn(
            configMap,
            pairs
        );
    }
}
