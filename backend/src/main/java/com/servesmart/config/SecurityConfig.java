package com.servesmart.config;

import com.servesmart.auth.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter, CustomUserDetailsService userDetailsService) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/v1/auth/login", "/api/v1/auth/refresh").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()

                // Support tickets — POST is public (login page contact form)
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/v1/support/tickets").permitAll()

                // Feedback — POST is public (customer-facing)
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/v1/feedback").permitAll()

                // Support ticket management — SUPER_ADMIN only
                .requestMatchers("/api/v1/support/tickets/*/assign").hasRole("SUPER_ADMIN")
                .requestMatchers(org.springframework.http.HttpMethod.PATCH, "/api/v1/support/tickets/*/status").hasRole("SUPER_ADMIN")
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/support/tickets").hasAnyRole("SUPER_ADMIN", "MANAGER")
                .requestMatchers("/api/v1/support/**").authenticated()

                // Employee management — MANAGER only (also handled by @PreAuthorize)
                .requestMatchers("/api/v1/employees/**").hasAnyRole("MANAGER", "SUPER_ADMIN")

                // Customer management — WAITER, MANAGER
                .requestMatchers("/api/v1/customers/**").hasAnyRole("WAITER", "MANAGER", "SUPER_ADMIN")

                // Menu — read is any authenticated, write is MANAGER (handled by @PreAuthorize)
                .requestMatchers("/api/v1/menu/**").authenticated()

                // Tables — WAITER, MANAGER
                .requestMatchers("/api/v1/tables/**").hasAnyRole("WAITER", "MANAGER", "SUPER_ADMIN")

                // Orders — WAITER, MANAGER, CHEF, CASHIER
                .requestMatchers("/api/v1/orders/*/cancel").hasAnyRole("MANAGER", "SUPER_ADMIN")
                .requestMatchers("/api/v1/orders/**").hasAnyRole("WAITER", "MANAGER", "CHEF", "CASHIER", "SUPER_ADMIN")

                // Kitchen — CHEF, MANAGER
                .requestMatchers("/api/v1/kitchen/**").hasAnyRole("CHEF", "MANAGER", "SUPER_ADMIN")

                // Billing — CASHIER, MANAGER
                .requestMatchers("/api/v1/bills/**").hasAnyRole("CASHIER", "MANAGER", "SUPER_ADMIN")

                // Inventory — MANAGER, CHEF
                .requestMatchers("/api/v1/inventory/low-stock").hasAnyRole("MANAGER", "SUPER_ADMIN")
                .requestMatchers("/api/v1/inventory/expiring").hasAnyRole("MANAGER", "SUPER_ADMIN")
                .requestMatchers("/api/v1/inventory/*/stock-in").hasAnyRole("MANAGER", "SUPER_ADMIN")
                .requestMatchers("/api/v1/inventory/*/stock-out").hasAnyRole("MANAGER", "CHEF", "SUPER_ADMIN")
                .requestMatchers("/api/v1/inventory/**").hasAnyRole("MANAGER", "CHEF", "SUPER_ADMIN")

                // Suppliers & Purchase Orders — MANAGER only
                .requestMatchers("/api/v1/suppliers/**").hasAnyRole("MANAGER", "SUPER_ADMIN")
                .requestMatchers("/api/v1/purchase-orders/**").hasAnyRole("MANAGER", "SUPER_ADMIN")

                // Reports — MANAGER only
                .requestMatchers("/api/v1/reports/**").hasAnyRole("MANAGER", "SUPER_ADMIN")

                // Notifications — any authenticated
                .requestMatchers("/api/v1/notifications/**").authenticated()

                .anyRequest().authenticated()
            )
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
        configuration.setAllowedOrigins(java.util.List.of("http://localhost:5173"));
        configuration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(java.util.List.of("Authorization", "Content-Type", "Idempotency-Key"));
        configuration.setExposedHeaders(java.util.List.of("Authorization"));
        configuration.setAllowCredentials(true);
        
        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
