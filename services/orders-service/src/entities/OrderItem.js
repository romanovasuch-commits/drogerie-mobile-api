const { Entity, PrimaryGeneratedColumn, Column, ManyToOne } = require("typeorm");
const Order = require("./Order");

@Entity({ name: "order_items" })
class OrderItem {
  @PrimaryGeneratedColumn("uuid")
  id;

  @Column({ type: "uuid" })
  productId;

  @Column({ type: "int" })
  qty;

  @Column({ type: "numeric", precision: 12, scale: 2 })
  price;

  @ManyToOne(() => Order, (o) => o.items, { onDelete: "CASCADE" })
  order;
}

module.exports = OrderItem;