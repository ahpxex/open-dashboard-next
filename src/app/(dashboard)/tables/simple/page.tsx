"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type SimpleUser, simpleHandlers } from "@/examples/simple";

const statusBadgeClass: Record<SimpleUser["status"], string> = {
  active:
    "border-transparent bg-green-500/15 text-green-700 dark:text-green-400",
  pending:
    "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400",
  inactive: "border-transparent bg-destructive/15 text-destructive",
};

export default function SimplePage() {
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    simpleHandlers
      .list?.({})
      .then((result) => {
        setUsers(result.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load users:", error);
        setIsLoading(false);
      });
  }, []);

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "status", label: "Status" },
    { key: "role", label: "Role" },
  ];

  const renderCell = (user: SimpleUser, columnKey: string) => {
    switch (columnKey) {
      case "name":
        return <span className="font-medium">{user.name}</span>;
      case "email":
        return <span className="text-muted-foreground">{user.email}</span>;
      case "status":
        return (
          <Badge variant="outline" className={statusBadgeClass[user.status]}>
            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
          </Badge>
        );
      case "role":
        return <span className="text-muted-foreground">{user.role}</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Simple Table</h1>
        <p className="mt-2 text-muted-foreground">
          A simple table example using shadcn/ui components
        </p>
      </div>

      <div className="rounded-none border">
        <Table aria-label="Simple user table">
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <div className="flex items-center justify-center py-10">
                    <Spinner />
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-10 text-center text-muted-foreground"
                >
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {renderCell(user, column.key)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
