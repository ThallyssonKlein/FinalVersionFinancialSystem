package com.expending.rules_engine.adapters.inbound;

import com.expending.rules_engine.adapters.mapper.ConfigsForTransactionsMapper;
import com.expending.rules_engine.domain.config.ConfigService;
import com.expending.rules_engine.domain.ConfigsForTransactionsBO;
import com.expending.rules_engine.ports.inbound.http.api.v1.dto.outbound.ConfigsForTransactionsOutboundDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import com.ports.inbound.http.api.v1.dto.inbound.determine_configs_for_transactions.DetermineConfigsForTransactionsInboundDTO;

@Component
@Slf4j
public class InboundConfigAdapter {

    @Autowired
    private ConfigService configService;

    public ConfigsForTransactionsOutboundDTO determineConfigsForTransactions(DetermineConfigsForTransactionsInboundDTO determineConfigsForTransactionsInboundDTO) {
        log.info("Determining configs for transactions");

        ConfigsForTransactionsBO configsForTransactionsBO = configService.determineConfigsForTransactions(determineConfigsForTransactionsInboundDTO.getDefault_config(), determineConfigsForTransactionsInboundDTO.getConfigs(), determineConfigsForTransactionsInboundDTO.getTransactions(), determineConfigsForTransactionsInboundDTO.getTransactionsGroupedByDateBO());

        log.info("Configs for transactions determined");

        return ConfigsForTransactionsMapper.INSTANCE.toOutboundDTO(configsForTransactionsBO);
    }
}
