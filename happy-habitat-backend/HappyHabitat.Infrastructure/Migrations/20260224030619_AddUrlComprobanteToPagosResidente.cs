using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HappyHabitat.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUrlComprobanteToPagosResidente : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UrlComprobante",
                table: "PagosResidente",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UrlComprobante",
                table: "PagosResidente");
        }
    }
}
