import {
  createStudio,
  getStudios,
  getStudioById,
  updateStudio,
  deleteStudio,
} from "../services/studio.service.js";

// 1. Create Studio
export const createStudioController = async (req, res, next) => {
  try {
    const studioData = {
      ...req.validatedData.body,
      ownerId: req.user.id,
      ownerEmail: req.user.email,
      ownerName: req.user.name,
    };

    const studio = await createStudio(studioData);

    res.status(201).json({
      success: true,
      message: "Studio created successfully",
      data: studio,
    });
  } catch (error) {
    next(error);
  }
};

// 2. Get All Studios
export const getStudiosController = async (req, res, next) => {
  try {
    const result = await getStudios(req.validatedData.query);

    res.status(200).json({
      success: true,
      message: "Studios fetched successfully",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// 3. Get Single Studio
export const getStudioByIdController = async (req, res, next) => {
  try {
    const studio = await getStudioById(req.params.id);

    res.status(200).json({
      success: true,
      message: "Studio fetched successfully",
      data: studio,
    });
  } catch (error) {
    next(error);
  }
};

// 4. Update Studio
export const updateStudioController = async (req, res, next) => {
  try {
    const studio = await updateStudio(
      req.params.id,
      req.user.id,
      req.validatedData.body
    );

    res.status(200).json({
      success: true,
      message: "Studio updated successfully",
      data: studio,
    });
  } catch (error) {
    next(error);
  }
};

// 5. Delete Studio
export const deleteStudioController = async (req, res, next) => {
  try {
    const studio = await deleteStudio(
      req.params.id,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: "Studio deleted successfully",
      data: studio,
    });
  } catch (error) {
    next(error);
  }
};