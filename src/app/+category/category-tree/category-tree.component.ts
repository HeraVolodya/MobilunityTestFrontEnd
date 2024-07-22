import { Component, OnInit } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener, MatTreeModule } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Category } from '../../core/interfaces/category';
import {CategoryService} from "../../core/servises/category.service";

interface FoodNode {
  name: string;
  children?: FoodNode[];
}

/** Flat node with expandable and level information */
interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

@Component({
  selector: 'app-category-tree',
  templateUrl: './category-tree.component.html',
  styleUrls: ['./category-tree.component.scss'],
  standalone: true,
  imports: [MatTreeModule, MatButtonModule, MatIconModule],
})
export class CategoryTreeComponent implements OnInit {
  private _transformer = (node: FoodNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
    };
  };

  treeControl = new FlatTreeControl<ExampleFlatNode>(
    node => node.level,
    node => node.expandable,
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children,
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe(categories => {
      this.dataSource.data = this.buildTree(categories);
    });
  }

  buildTree(categories: Category[]): FoodNode[] {
    const rootNodes: FoodNode[] = [];

    const categoryMap: { [key: number]: FoodNode } = {};

    categories.forEach(category => {
      const node: FoodNode = { name: category.categoryName, children: [] };
      categoryMap[category.categoryId] = node;

      if (category.parentCategoryId === null) {
        rootNodes.push(node);
      } else {
        const parentNode = categoryMap[category.parentCategoryId];
        if (parentNode) {
          parentNode.children = parentNode.children || [];
          parentNode.children.push(node);
        }
      }
    });

    return rootNodes;
  }

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;
}
