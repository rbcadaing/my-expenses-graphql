import { randomUUID } from 'crypto';

export class Category {
  private constructor(
    public readonly id: string,
    public name: string,
    public description: string | null,
    public color: string
  ) {}

  static create(
    name: string,
    description: string | null,
    color: string
  ): Category {
    if (!name || name.trim().length === 0) {
      throw new Error('Category name cannot be empty');
    }

    return new Category(
      randomUUID(),
      name,
      description,
      color || '#000000'
    );
  }

  static fromDatabase(
    id: string,
    name: string,
    description: string | null,
    color: string
  ): Category {
    return new Category(id, name, description, color);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      color: this.color
    };
  }
}
