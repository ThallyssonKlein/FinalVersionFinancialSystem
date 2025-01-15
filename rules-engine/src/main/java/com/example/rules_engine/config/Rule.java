package com.example.rules_engine.config;

import lombok.Getter;
import lombok.Setter;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.util.Date;

@Getter
@Setter
public class Rule{
    private String useInCalculation;
    private Type type;
    private Between between;
    private String property;
    private Object contains;
    private Object equals;
    private Frequency frequency;

    public void setuseInCalculation(String useInCalculationValue, UseInCalculation useInCalculation) {
        try {
            Field field = useInCalculation.getClass().getDeclaredField(useInCalculationValue);
            if (field != null) {
                this.useInCalculation = useInCalculationValue;
            } else {
                System.out.println("Field does not exist");
            }
        } catch (NoSuchFieldException e) {
            System.out.println("Field does not exist");
        }
    }

    public void setEquals(Object equals) {
        if (equals instanceof BigDecimal || equals instanceof Date || equals instanceof Integer) {
            this.equals = equals;
        } else {
            throw new IllegalArgumentException("Invalid type for equals field");
        }
    }
}
