package models;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class Allocation {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	public int id;
	@Column(nullable = false)
	public Integer jobId;
	@Column(nullable = false)
	public Integer studentId;
}