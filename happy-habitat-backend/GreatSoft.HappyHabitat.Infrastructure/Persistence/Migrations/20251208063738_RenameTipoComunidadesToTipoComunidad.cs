using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GreatSoft.HappyHabitat.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RenameTipoComunidadesToTipoComunidad : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_TipoComunidades",
                table: "TipoComunidades");

            migrationBuilder.RenameTable(
                name: "TipoComunidades",
                newName: "TipoComunidad");

            migrationBuilder.RenameIndex(
                name: "IX_TipoComunidades_Code",
                table: "TipoComunidad",
                newName: "IX_TipoComunidad_Code");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TipoComunidad",
                table: "TipoComunidad",
                column: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_TipoComunidad",
                table: "TipoComunidad");

            migrationBuilder.RenameTable(
                name: "TipoComunidad",
                newName: "TipoComunidades");

            migrationBuilder.RenameIndex(
                name: "IX_TipoComunidad_Code",
                table: "TipoComunidades",
                newName: "IX_TipoComunidades_Code");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TipoComunidades",
                table: "TipoComunidades",
                column: "Id");
        }
    }
}
