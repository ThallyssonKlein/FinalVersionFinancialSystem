package com.example.rules_engine;

import com.example.rules_engine.config.Config;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
class Pair {
    private String pairName;
    private Long configId;
    private String[] transactionIds;
}

@Getter
@Setter
@AllArgsConstructor
public class ConfigsForTransactionsReturn {
    Map<String, Config> configTransactionAssociation;
    List<Pair> pairs;
}
