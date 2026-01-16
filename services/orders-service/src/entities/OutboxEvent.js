const { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } = require("typeorm");

@Entity({ name: "outbox_events" })
class OutboxEvent {
  @PrimaryGeneratedColumn("uuid")
  id;

  @Index()
  @Column({ type: "uuid" })
  aggregateId; // orderId

  @Column({ type: "varchar", length: 50 })
  type; // OrderCreated, OrderPaid ...

  @Column({ type: "jsonb" })
  payload;

  @Column({ type: "varchar", length: 20, default: "NEW" }) // NEW, PUBLISHED, FAILED
  status;

  @CreateDateColumn()
  createdAt;
}

module.exports = OutboxEvent;