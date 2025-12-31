package com.bank.insights;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
@SpringBootApplication
@EnableDiscoveryClient
public class InsightsApplication {

	public static void main(String[] args) {
		SpringApplication.run(InsightsApplication.class, args);
	}

}