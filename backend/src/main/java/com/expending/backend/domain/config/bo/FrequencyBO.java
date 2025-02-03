package com.expending.backend.domain.config.bo;

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
