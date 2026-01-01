using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GreatSoft.HappyHabitat.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTipoComunidadEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TipoComunidades",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    Code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TipoComunidades", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TipoComunidades_Code",
                table: "TipoComunidades",
                column: "Code",
                unique: true);

            // Seed initial TipoComunidad data
            migrationBuilder.InsertData(
                table: "TipoComunidades",
                columns: new[] { "Id", "Code", "Description" },
                values: new object[,]
                {
                    { "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "COLONIA", "Colonia" },
                    { "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", "FRACCIONAMIENTO", "Fraccionamiento" },
                    { "cccccccc-cccc-cccc-cccc-cccccccccccc", "COTO", "Coto" },
                    { "dddddddd-dddd-dddd-dddd-dddddddddddd", "EDIFICIO", "Edificio" },
                    { "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee", "CONDOMINIO", "Condominio" },
                    { "ffffffff-ffff-ffff-ffff-ffffffffffff", "COMUNIDAD", "Comunidad" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TipoComunidades");
        }
    }
}
