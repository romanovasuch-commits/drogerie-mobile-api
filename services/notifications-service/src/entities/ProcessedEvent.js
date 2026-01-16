const { Entity, PrimaryColumn, CreateDateColumn } = require("typeorm");

@Entity({ name: "processed_events" })
class ProcessedEvent {
  @PrimaryColumn("uuid")
  eventId;

  @CreateDateColumn()
  processedAt;
}

module.exports = ProcessedEvent;