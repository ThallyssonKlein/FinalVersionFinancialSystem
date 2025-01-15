package com.example.rules_engine.transaction;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Date;

@Getter
@Setter
public class Transaction {
    private String id;
    private String description;
    private Type type;
    private BigDecimal value;
    private Date date;
}
