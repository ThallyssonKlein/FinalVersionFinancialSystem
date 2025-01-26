package com.expending.rules_engine.domain.config.bo;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class FrequencyBO {
    private Integer value;
    private UnityBO unityBO;
    private Integer targetNumber;
}
