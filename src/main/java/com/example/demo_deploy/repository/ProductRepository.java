package com.example.demo_deploy.repository;

import com.example.demo_deploy.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {}
