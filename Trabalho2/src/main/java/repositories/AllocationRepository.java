package repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import models.Allocation;

@Repository
public interface AllocationRepository extends JpaRepository<Allocation, Integer> {}