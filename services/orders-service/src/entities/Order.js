const { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } = require("typeorm");
const OrderItem = require("./OrderItem");

@Entity({ name: "orders" })
class Order {
  @PrimaryGeneratedColumn("uuid")
  id;

  @Column({ type: "uuid" })
  userId;

  @Column({ type: "varchar", length: 30, default: "CREATED" })
  status;

  @Column({ type: "numeric", precision: 12, scale: 2, default: 0 })
  totalPrice;

  @OneToMany(() => OrderItem, (i) => i.order, { cascade: true })
  items;

  @CreateDateColumn()
  createdAt;
}

module.exports = Order;