package com.expending.rules_engine.ports.outbound.database;

import com.expending.rules_engine.domain.config.bo.Frequency;
import com.expending.rules_engine.domain.transaction.bo.Transaction;

import java.util.List;

public class SavedTransactionsRepository {
    public List<Transaction> findTransactionsInLastXFrequencyX(Frequency frequency) {
        String query = "SELECT * FROM transactions WHERE date ";

        switch (frequency.getUnity()) {
            case DAY:
                query += "BETWEEN NOW() - INTERVAL " + frequency.getValue() + " DAY AND NOW()";
                break;
            case WEEK:
                query += "BETWEEN NOW() - INTERVAL " + frequency.getValue() + " WEEK AND NOW()";
                break;
            case MONTH:
                query += "BETWEEN NOW() - INTERVAL " + frequency.getValue() + " MONTH AND NOW()";
                break;
            case YEAR:
                query += "BETWEEN NOW() - INTERVAL " + frequency.getValue() + " YEAR AND NOW()";
                break;
        }
    }
}
