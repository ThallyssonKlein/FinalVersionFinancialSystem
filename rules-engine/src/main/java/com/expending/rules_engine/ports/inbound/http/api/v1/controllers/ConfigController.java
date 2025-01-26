package com.expending.rules_engine.ports.inbound.http.api.v1.controllers;

import com.expending.rules_engine.adapters.inbound.InboundConfigAdapter;
import com.expending.rules_engine.ports.inbound.http.api.v1.dto.inbound.determine_configs_for_transactions.DetermineConfigsForTransactionsInboundDTO;
import com.expending.rules_engine.ports.inbound.http.api.v1.dto.outbound.ConfigsForTransactionsOutboundDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/config")
@Slf4j
public class ConfigController {

    @Autowired
    private InboundConfigAdapter inboundConfigAdapter;

    @GetMapping("/determine_configs_for_transactions")
    public ResponseEntity<ConfigsForTransactionsOutboundDTO> determine_configs_for_transactions(
            @RequestBody @Valid DetermineConfigsForTransactionsInboundDTO determineConfigsForTransactionsInboundDTO) {
        log.info("Request received to determine configs for transactions");

        ConfigsForTransactionsOutboundDTO configsForTransactionsOutboundDTO = inboundConfigAdapter.determineConfigsForTransactions(determineConfigsForTransactionsInboundDTO);

        return ResponseEntity.ok(configsForTransactionsOutboundDTO);
    }
}
