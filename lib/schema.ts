// This is a schema definition for a SQL database
// You would implement this with your database of choice (Prisma, Drizzle, etc.)

export const staffTable = {
  id: "UUID PRIMARY KEY",
  name: "TEXT NOT NULL",
  phoneNumber: "TEXT NOT NULL UNIQUE",
  role: "TEXT NOT NULL",
  property: "TEXT",
  createdAt: "TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP",
}

export const receiptsTable = {
  id: "UUID PRIMARY KEY",
  vendor: "TEXT NOT NULL",
  amount: "DECIMAL(10, 2) NOT NULL",
  date: "DATE NOT NULL",
  phoneNumber: "TEXT NOT NULL",
  staffId: "UUID REFERENCES staff(id)",
  imageUrl: "TEXT NOT NULL",
  createdAt: "TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP",
}
