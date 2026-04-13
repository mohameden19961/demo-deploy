package com.example.demo_deploy.service;

import com.example.demo_deploy.model.Product;
import com.example.demo_deploy.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository repo;

    public List<Product> getAll() { return repo.findAll(); }
    public Product getById(Long id) { return repo.findById(id).orElseThrow(); }
    public Product create(Product p) { return repo.save(p); }
    public Product update(Long id, Product p) {
        Product existing = getById(id);
        existing.setName(p.getName());
        existing.setPrice(p.getPrice());
        return repo.save(existing);
    }
    public void delete(Long id) { repo.deleteById(id); }
}
