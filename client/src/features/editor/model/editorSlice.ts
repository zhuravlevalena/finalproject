import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { CanvasElement, EditorState } from '@/entities/editor/model/editor.schemas';

const initialState: EditorState = {
  currentLayoutId: null,
  elements: [],
  selectedElementId: null,
  history: {
    past: [],
    future: [],
  },
  canvas: {
    width: 900,
    height: 1200,
    backgroundColor: '#ffffff',
  },
  zoom: 100,
  isDirty: false,
};

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    // Загрузка макета
    loadLayout: (state, action: PayloadAction<{ layoutId: number; elements: CanvasElement[] }>) => {
      state.currentLayoutId = action.payload.layoutId;
      state.elements = action.payload.elements;
      state.selectedElementId = null;
      state.history = { past: [], future: [] };
      state.isDirty = false;
    },

    // Добавление элемента
    addElement: (state, action: PayloadAction<CanvasElement>) => {
      state.history.past.push([...state.elements]);
      state.history.future = [];
      state.elements.push(action.payload);
      state.selectedElementId = action.payload.id;
      state.isDirty = true;
    },

    // Обновление элемента
    updateElement: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<CanvasElement> }>,
    ) => {
      const index = state.elements.findIndex((el) => el.id === action.payload.id);
      if (index !== -1) {
        state.history.past.push([...state.elements]);
        state.history.future = [];
        state.elements[index] = { ...state.elements[index], ...action.payload.updates };
        state.isDirty = true;
      }
    },

    // Удаление элемента
    deleteElement: (state, action: PayloadAction<string>) => {
      state.history.past.push([...state.elements]);
      state.history.future = [];
      state.elements = state.elements.filter((el) => el.id !== action.payload);
      if (state.selectedElementId === action.payload) {
        state.selectedElementId = null;
      }
      state.isDirty = true;
    },

    // Выбор элемента
    selectElement: (state, action: PayloadAction<string | null>) => {
      state.selectedElementId = action.payload;
    },

    // Дублирование элемента
    duplicateElement: (state, action: PayloadAction<string>) => {
      const element = state.elements.find((el) => el.id === action.payload);
      if (element) {
        state.history.past.push([...state.elements]);
        state.history.future = [];
        const newElement: CanvasElement = {
          ...element,
          id: `${element.id}-copy-${Date.now()}`,
          left: element.left + 20,
          top: element.top + 20,
        };
        state.elements.push(newElement);
        state.selectedElementId = newElement.id;
        state.isDirty = true;
      }
    },

    // Изменение порядка (z-index)
    bringToFront: (state, action: PayloadAction<string>) => {
      const element = state.elements.find((el) => el.id === action.payload);
      if (element) {
        const maxZIndex = Math.max(...state.elements.map((el) => el.zIndex || 0));
        element.zIndex = maxZIndex + 1;
        state.isDirty = true;
      }
    },

    sendToBack: (state, action: PayloadAction<string>) => {
      const element = state.elements.find((el) => el.id === action.payload);
      if (element) {
        const minZIndex = Math.min(...state.elements.map((el) => el.zIndex || 0));
        element.zIndex = minZIndex - 1;
        state.isDirty = true;
      }
    },

    // Undo/Redo
    undo: (state) => {
      if (state.history.past.length > 0) {
        const previous = state.history.past[state.history.past.length - 1];
        state.history.future.unshift([...state.elements]);
        state.elements = previous;
        state.history.past = state.history.past.slice(0, -1);
        state.isDirty = true;
      }
    },

    redo: (state) => {
      if (state.history.future.length > 0) {
        const next = state.history.future[0];
        state.history.past.push([...state.elements]);
        state.elements = next;
        state.history.future = state.history.future.slice(1);
        state.isDirty = true;
      }
    },

    // Изменение масштаба
    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = action.payload;
    },

    // Сброс состояния
    resetEditor: (state) => {
      return initialState;
    },

    // Отметка как сохраненное
    markAsSaved: (state) => {
      state.isDirty = false;
    },
  },
});

export const {
  loadLayout,
  addElement,
  updateElement,
  deleteElement,
  selectElement,
  duplicateElement,
  bringToFront,
  sendToBack,
  undo,
  redo,
  setZoom,
  resetEditor,
  markAsSaved,
} = editorSlice.actions;

export default editorSlice.reducer;
