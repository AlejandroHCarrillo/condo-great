using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HappyHabitat.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRequiereAprobacionToAmenity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "RequiereAprobacion",
                table: "Amenities",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RequiereAprobacion",
                table: "Amenities");
        }
    }
}
