const { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } = require("typeorm");

@Entity({ name: "users" })
class User {
  @PrimaryGeneratedColumn("uuid")
  id;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 120 })
  email;

  @Column({ type: "varchar", length: 200 })
  passwordHash;

  @Column({ type: "varchar", length: 20, default: "user" })
  role;

  @CreateDateColumn()
  createdAt;
}

module.exports = User;