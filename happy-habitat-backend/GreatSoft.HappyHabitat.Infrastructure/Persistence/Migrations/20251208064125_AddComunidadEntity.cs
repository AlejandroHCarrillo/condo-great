using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GreatSoft.HappyHabitat.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddComunidadEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Comunidad",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    TipoComunidadId = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Ubicacion = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Lat = table.Column<decimal>(type: "decimal(18,6)", nullable: false),
                    Lng = table.Column<decimal>(type: "decimal(18,6)", nullable: false),
                    CantidadViviendas = table.Column<int>(type: "int", nullable: false),
                    Contacto = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ContactoTelefono = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ContactoEmail = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Comunidad", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Comunidad_TipoComunidad_TipoComunidadId",
                        column: x => x.TipoComunidadId,
                        principalTable: "TipoComunidad",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Comunidad_TipoComunidadId",
                table: "Comunidad",
                column: "TipoComunidadId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Comunidad");
        }
    }
}
