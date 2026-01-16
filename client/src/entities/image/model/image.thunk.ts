import { createAsyncThunk } from '@reduxjs/toolkit';
import { imageService } from '../api/image.service';
import type { Image } from './image.types';

export const fetchImagesThunk = createAsyncThunk(
  'image/fetchAll',
  async (): Promise<Image[]> => {
    return imageService.getAll();
  }
);

export const fetchImageByIdThunk = createAsyncThunk(
  'image/fetchById',
  async (id: number): Promise<Image> => {
    return imageService.getById(id);
  }
);

export const uploadImageThunk = createAsyncThunk(
  'image/upload',
  async (file: File): Promise<Image> => {
    return imageService.upload(file);
  }
);

export const deleteImageThunk = createAsyncThunk(
  'image/delete',
  async (id: number): Promise<void> => {
    await imageService.delete(id);
    return id;
  }
);
