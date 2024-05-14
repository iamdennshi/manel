from pydantic import BaseModel
from datetime import datetime


class Id(BaseModel):
     id: int

class Object(BaseModel):
      id: int
      cord_x: float
      cord_y: float
      address: str
      total_area: float
      class Config:
        orm_mode = True

class Element(BaseModel):
     cords: list[float] | None = None
     name: str | None = None
     lastChange: datetime | None = None


class ElementWithId(Element, Id):
     pass

class ElementWithoutId(Element):
     pass

class Tree(ElementWithoutId):
    photos: list[str] | None = None
    height: int | None = None
    trunkDiameter: int | None = None
    aestaticAssessment: int | None = None
    comment: str | None = None
    age: int | None = None
    crownProjection: int | None = None
    typeOfDamage: list[int] | None = None
    recommendation: list[int] | None = None
    trunkNumber: int | None = None
    sanitaryCondition: int | None = None


class TreeWithId(Tree, Id):
     pass

class TreeWithoutId(Tree):
     pass

class Elements(BaseModel):
     trees: list[ElementWithId]
     furnitures: list[ElementWithId]
     areas: list[ElementWithId] | None = None


class Furniture(ElementWithoutId):
     pass

class FurnitureWithoutId(Furniture):
     pass


class FurnitureWithId(Furniture, Id):
     pass