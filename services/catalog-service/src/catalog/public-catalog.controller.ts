import { Controller, Get, Param, Query } from "@nestjs/common";
import { CatalogService } from "./catalog.service";

@Controller("public")
export class PublicCatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get("categories")
  findCategories() {
    return this.catalogService.findCategories();
  }

  @Get("catalog")
  findCatalog(@Query("categoryId") categoryId?: string) {
    return this.catalogService.findCatalog(categoryId);
  }

  @Get("catalog/:id")
  findCatalogItem(@Param("id") id: string) {
    return this.catalogService.findCatalogItem(id);
  }
}
