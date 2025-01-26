package com.expending.rules_engine.adapters.inbound;

import com.expending.rules_engine.adapters.mapper.ConfigMapper;
import com.expending.rules_engine.adapters.mapper.TransactionMapper;
import com.expending.rules_engine.domain.config.ConfigService;
import com.expending.rules_engine.domain.ConfigsForTransactionsBO;
import com.expending.rules_engine.ports.inbound.http.api.v1.dto.inbound.determine_configs_for_transactions.DetermineConfigsForTransactionsInboundDTO;
import com.expending.rules_engine.ports.inbound.http.api.v1.dto.outbound.ConfigsForTransactionsOutboundDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class InboundConfigAdapter {

    @Autowired
    private ConfigService configService;

    public ConfigsForTransactionsOutboundDTO determineConfigsForTransactions(DetermineConfigsForTransactionsInboundDTO determineConfigsForTransactionsInboundDTO) {
        log.info("Determining configs for transactions");

        ConfigMapper configMapper = ConfigMapper.INSTANCE;
        TransactionMapper transactionMapper = TransactionMapper.INSTANCE;

        ConfigsForTransactionsBO configsForTransactionsBO = configService.determineConfigsForTransactions(
                configMapper.toConfigBO(determineConfigsForTransactionsInboundDTO.getDefault_config()),
                configMapper.toConfigBOList(determineConfigsForTransactionsInboundDTO.getConfigs()),
                transactionMapper.toTransactionBOList(determineConfigsForTransactionsInboundDTO.getTransactions()),
                transactionMapper.toTransactionBOMapList(determineConfigsForTransactionsInboundDTO.getTransactions_grouped_by_date()));

        log.info("Configs for transactions determined");

        ConfigsForTransactionsOutboundDTO configsForTransactionsOutboundDTO = new ConfigsForTransactionsOutboundDTO();
        configsForTransactionsOutboundDTO.setConfig_transaction_association(configMapper.toConfigDTOMap(configsForTransactionsBO.getConfigTransactionAssociation()));
    }
}
