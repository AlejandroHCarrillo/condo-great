using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HappyHabitat.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAuditBaseColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add new audit columns first, then convert CreatedAt/UpdatedAt from nvarchar to datetime2
            // (SQL Server cannot ALTER COLUMN nvarchar -> datetime2; we add temp column, copy, drop, rename)

            ConvertCreatedAtAndAddAuditColumns(migrationBuilder, "Vehicles");
            ConvertCreatedAtAndAddAuditColumns(migrationBuilder, "Users");
            ConvertCreatedAtAndAddAuditColumns(migrationBuilder, "UserRoles");
            ConvertCreatedAtAndAddAuditColumns(migrationBuilder, "UserCommunities");
            ConvertCreatedAtAndAddAuditColumns(migrationBuilder, "ResidentVisits");
            ConvertCreatedAtAndAddAuditColumns(migrationBuilder, "Residents");
            ConvertCreatedAtAndAddAuditColumns(migrationBuilder, "Pets");
            ConvertCreatedAtAndAddAuditColumns(migrationBuilder, "PagoCargoComunidad");
            ConvertCreatedAtAndAddAuditColumns(migrationBuilder, "Documents");
            ConvertCreatedAtAndAddAuditColumns(migrationBuilder, "Comunicados");
            ConvertCreatedAtAndAddAuditColumns(migrationBuilder, "Banners");
            ConvertCreatedAtAndAddAuditColumns(migrationBuilder, "Amenities");

            // CargosComunidad has both CreatedAt and UpdatedAt as nvarchar
            ConvertCargosComunidadAuditColumns(migrationBuilder);
        }

        private static void ConvertCreatedAtAndAddAuditColumns(MigrationBuilder migrationBuilder, string table)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: table,
                type: "uniqueidentifier",
                nullable: true);
            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: table,
                type: "datetime2",
                nullable: true);
            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: table,
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "_CreatedAtNew",
                table: table,
                type: "datetime2",
                nullable: true);
            migrationBuilder.Sql($"UPDATE [{table}] SET [_CreatedAtNew] = TRY_CAST([CreatedAt] AS datetime2); UPDATE [{table}] SET [_CreatedAtNew] = GETUTCDATE() WHERE [_CreatedAtNew] IS NULL;");
            migrationBuilder.Sql($"ALTER TABLE [{table}] ALTER COLUMN [_CreatedAtNew] datetime2 NOT NULL;");
            migrationBuilder.DropColumn(name: "CreatedAt", table: table);
            migrationBuilder.RenameColumn(name: "_CreatedAtNew", table: table, newName: "CreatedAt");
        }

        private static void ConvertCargosComunidadAuditColumns(MigrationBuilder migrationBuilder)
        {
            const string table = "CargosComunidad";
            migrationBuilder.AddColumn<Guid>(name: "CreatedByUserId", table: table, type: "uniqueidentifier", nullable: true);
            migrationBuilder.AddColumn<Guid>(name: "UpdatedByUserId", table: table, type: "uniqueidentifier", nullable: true);
            migrationBuilder.AddColumn<DateTime>(name: "_CreatedAtNew", table: table, type: "datetime2", nullable: true);
            migrationBuilder.AddColumn<DateTime>(name: "_UpdatedAtNew", table: table, type: "datetime2", nullable: true);
            migrationBuilder.Sql($"UPDATE [{table}] SET [_CreatedAtNew] = TRY_CAST([CreatedAt] AS datetime2); UPDATE [{table}] SET [_CreatedAtNew] = GETUTCDATE() WHERE [_CreatedAtNew] IS NULL;");
            migrationBuilder.Sql($"UPDATE [{table}] SET [_UpdatedAtNew] = TRY_CAST([UpdatedAt] AS datetime2);");
            migrationBuilder.Sql($"ALTER TABLE [{table}] ALTER COLUMN [_CreatedAtNew] datetime2 NOT NULL;");
            migrationBuilder.DropColumn(name: "CreatedAt", table: table);
            migrationBuilder.DropColumn(name: "UpdatedAt", table: table);
            migrationBuilder.RenameColumn(name: "_CreatedAtNew", table: table, newName: "CreatedAt");
            migrationBuilder.RenameColumn(name: "_UpdatedAtNew", table: table, newName: "UpdatedAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            RevertCreatedAtAndDropAuditColumns(migrationBuilder, "Vehicles");
            RevertCreatedAtAndDropAuditColumns(migrationBuilder, "Users");
            RevertCreatedAtAndDropAuditColumns(migrationBuilder, "UserRoles");
            RevertCreatedAtAndDropAuditColumns(migrationBuilder, "UserCommunities");
            RevertCreatedAtAndDropAuditColumns(migrationBuilder, "ResidentVisits");
            RevertCreatedAtAndDropAuditColumns(migrationBuilder, "Residents");
            RevertCreatedAtAndDropAuditColumns(migrationBuilder, "Pets");
            RevertCreatedAtAndDropAuditColumns(migrationBuilder, "PagoCargoComunidad");
            RevertCreatedAtAndDropAuditColumns(migrationBuilder, "Documents");
            RevertCreatedAtAndDropAuditColumns(migrationBuilder, "Comunicados");
            RevertCreatedAtAndDropAuditColumns(migrationBuilder, "Banners");
            RevertCreatedAtAndDropAuditColumns(migrationBuilder, "Amenities");
            RevertCargosComunidadAuditColumns(migrationBuilder);
        }

        private static void RevertCreatedAtAndDropAuditColumns(MigrationBuilder migrationBuilder, string table)
        {
            migrationBuilder.RenameColumn(name: "CreatedAt", table: table, newName: "_CreatedAtNew");
            migrationBuilder.AddColumn<string>(name: "CreatedAt", table: table, type: "nvarchar(max)", nullable: true);
            migrationBuilder.Sql($"UPDATE [{table}] SET [CreatedAt] = CONVERT(nvarchar(max), [_CreatedAtNew], 127);");
            migrationBuilder.Sql($"ALTER TABLE [{table}] ALTER COLUMN [CreatedAt] nvarchar(max) NOT NULL;");
            migrationBuilder.DropColumn(name: "_CreatedAtNew", table: table);
            migrationBuilder.DropColumn(name: "CreatedByUserId", table: table);
            migrationBuilder.DropColumn(name: "UpdatedAt", table: table);
            migrationBuilder.DropColumn(name: "UpdatedByUserId", table: table);
        }

        private static void RevertCargosComunidadAuditColumns(MigrationBuilder migrationBuilder)
        {
            const string table = "CargosComunidad";
            migrationBuilder.RenameColumn(name: "CreatedAt", table: table, newName: "_CreatedAtNew");
            migrationBuilder.RenameColumn(name: "UpdatedAt", table: table, newName: "_UpdatedAtNew");
            migrationBuilder.AddColumn<string>(name: "CreatedAt", table: table, type: "nvarchar(max)", nullable: true);
            migrationBuilder.AddColumn<string>(name: "UpdatedAt", table: table, type: "nvarchar(max)", nullable: true);
            migrationBuilder.Sql($"UPDATE [{table}] SET [CreatedAt] = CONVERT(nvarchar(max), [_CreatedAtNew], 127); UPDATE [{table}] SET [UpdatedAt] = CONVERT(nvarchar(max), [_UpdatedAtNew], 127);");
            migrationBuilder.Sql($"ALTER TABLE [{table}] ALTER COLUMN [CreatedAt] nvarchar(max) NOT NULL;");
            migrationBuilder.DropColumn(name: "_CreatedAtNew", table: table);
            migrationBuilder.DropColumn(name: "_UpdatedAtNew", table: table);
            migrationBuilder.DropColumn(name: "CreatedByUserId", table: table);
            migrationBuilder.DropColumn(name: "UpdatedByUserId", table: table);
        }
    }
}
