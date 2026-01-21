# Editor Entity

Типизированная система для работы с элементами canvas редактора карточек товаров.

## Архитектура

### Схемы данных (`model/editor.schemas.ts`)

Определяет типизированные структуры для:

- **CanvasElement** - базовый элемент canvas (текст, изображение, фигура)
- **ElementStyles** - стили элемента (цвет, шрифт, размер и т.д.)
- **ElementConstraints** - ограничения элемента (блокировка, минимальные размеры)
- **CanvasConfig** - конфигурация canvas (размер, фон)
- **EditorState** - состояние редактора (элементы, история, выбранный элемент)

### Конвертеры (`lib/fabric-converter.ts`)

Утилиты для конвертации между Fabric.js и нашей типизированной структурой:

```typescript
// Fabric.js → наша структура
const elements = fabricCanvasToElements(fabricJson);

// Наша структура → Fabric.js
const fabricJson = elementsToFabricCanvas(elements, canvasConfig);

// Один объект Fabric.js → CanvasElement
const element = fabricObjectToElement(fabricObject);

// CanvasElement → Fabric.js объект
const fabricObject = elementToFabricObject(element);
```

## Redux Store (`features/editor/model/editorSlice.ts`)

### State

```typescript
{
  currentLayoutId: number | null;
  elements: CanvasElement[];
  selectedElementId: string | null;
  history: {
    past: CanvasElement[][];
    future: CanvasElement[][];
  };
  canvas: CanvasConfig;
  zoom: number;
  isDirty: boolean;
}
```

### Actions

#### Управление макетом

- `loadLayout({ layoutId, elements })` - загрузить макет
- `resetEditor()` - сбросить редактор

#### Управление элементами

- `addElement(element)` - добавить элемент
- `updateElement({ id, updates })` - обновить элемент
- `deleteElement(id)` - удалить элемент
- `duplicateElement(id)` - дублировать элемент

#### Выбор и порядок

- `selectElement(id)` - выбрать элемент
- `bringToFront(id)` - переместить на передний план
- `sendToBack(id)` - переместить на задний план

#### История

- `undo()` - отменить
- `redo()` - повторить

#### Прочее

- `setZoom(zoom)` - изменить масштаб
- `markAsSaved()` - отметить как сохраненное

## Использование

### В компоненте редактора

```typescript
import { useAppDispatch, useAppSelector } from '@/shared/lib/hooks';
import {
  loadLayout,
  addElement,
  updateElement,
  selectElement,
} from '@/features/editor/model/editorSlice';
import { fabricCanvasToElements } from '@/entities/editor/lib/fabric-converter';

function EditorComponent() {
  const dispatch = useAppDispatch();
  const editorState = useAppSelector((state) => state.editor);

  // Загрузка макета
  useEffect(() => {
    const elements = fabricCanvasToElements(layoutData.canvasData);
    dispatch(loadLayout({ layoutId: layout.id, elements }));
  }, []);

  // Добавление текста
  const handleAddText = () => {
    const newElement: CanvasElement = {
      id: `text-${Date.now()}`,
      type: 'textbox',
      left: 100,
      top: 100,
      width: 200,
      text: 'Новый текст',
      fontSize: 24,
      fill: '#000000',
    };
    dispatch(addElement(newElement));
  };

  // Обновление элемента
  const handleUpdateElement = (id: string, updates: Partial<CanvasElement>) => {
    dispatch(updateElement({ id, updates }));
  };

  return (
    <div>
      <p>Элементов: {editorState.elements.length}</p>
      <p>Выбран: {editorState.selectedElementId}</p>
      <p>Изменено: {editorState.isDirty ? 'Да' : 'Нет'}</p>
    </div>
  );
}
```

### Типы элементов

```typescript
// Текст
{
  type: 'textbox',
  text: 'Привет',
  fontSize: 24,
  fontFamily: 'Arial',
  fill: '#000000',
}

// Изображение
{
  type: 'image',
  src: 'https://example.com/image.jpg',
  width: 300,
  height: 400,
}

// Прямоугольник
{
  type: 'rect',
  width: 200,
  height: 100,
  fill: '#3498db',
  stroke: '#2c3e50',
  strokeWidth: 2,
}

// Круг
{
  type: 'circle',
  radius: 50,
  fill: '#e74c3c',
}
```

## Интеграция с Fabric.js

Редактор использует Fabric.js для рендеринга, но хранит данные в типизированном формате:

1. **При загрузке**: Fabric.js JSON → CanvasElement[]
2. **При работе**: Изменения в Fabric.js → обновление Redux store
3. **При сохранении**: CanvasElement[] → Fabric.js JSON

Это дает:

- ✅ Типобезопасность
- ✅ Удобная работа с данными
- ✅ История изменений
- ✅ Легкое тестирование
- ✅ Совместимость с Fabric.js
