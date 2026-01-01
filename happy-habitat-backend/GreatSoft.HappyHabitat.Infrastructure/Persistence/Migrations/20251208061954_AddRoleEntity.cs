using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GreatSoft.HappyHabitat.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddRoleEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Roles_Code",
                table: "Roles",
                column: "Code",
                unique: true);

            // Seed initial roles
            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "Code", "Description", "IsActive" },
                values: new object[,]
                {
                    { "11111111-1111-1111-1111-111111111111", "SYSTEM_ADMIN", "System Administrator", true },
                    { "22222222-2222-2222-2222-222222222222", "ADMIN_COMPANY", "Company Administrator", true },
                    { "33333333-3333-3333-3333-333333333333", "COMITEE_MEMBER", "Committee Member", true },
                    { "44444444-4444-4444-4444-444444444444", "RESIDENT", "Resident", true },
                    { "55555555-5555-5555-5555-555555555555", "TENANT", "Tenant", true },
                    { "66666666-6666-6666-6666-666666666666", "VIGILANCE", "Vigilance", true }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Roles");
        }
    }
}
