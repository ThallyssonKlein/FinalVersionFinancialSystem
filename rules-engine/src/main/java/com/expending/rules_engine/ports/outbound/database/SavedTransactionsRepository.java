package com.expending.rules_engine.ports.outbound.database;

import com.expending.rules_engine.domain.config.bo.FrequencyBO;
import com.expending.rules_engine.domain.transaction.bo.TransactionBO;

import java.util.List;

public class SavedTransactionsRepository {
    public List<TransactionBO> findTransactionsInLastXFrequencyX(FrequencyBO frequencyBO) {
        String query = "SELECT * FROM transactions WHERE date ";

        switch (frequencyBO.getUnityBO()) {
            case DAY:
                query += "BETWEEN NOW() - INTERVAL " + frequencyBO.getValue() + " DAY AND NOW()";
                break;
            case WEEK:
                query += "BETWEEN NOW() - INTERVAL " + frequencyBO.getValue() + " WEEK AND NOW()";
                break;
            case MONTH:
                query += "BETWEEN NOW() - INTERVAL " + frequencyBO.getValue() + " MONTH AND NOW()";
                break;
            case YEAR:
                query += "BETWEEN NOW() - INTERVAL " + frequencyBO.getValue() + " YEAR AND NOW()";
                break;
        }
    }
}
