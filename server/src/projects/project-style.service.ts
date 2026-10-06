import { BadRequestException, Injectable } from '@nestjs/common';

import { StylePreferenceMode } from '../generated/prisma/client.js';

import { CreateProjectDto } from './dto/create-project.dto.js';

@Injectable()
export class ProjectStyleService {
  /**
   * --------------------------------------------------------------------------
   * Save Project Style Preference
   * --------------------------------------------------------------------------
   */
  async saveStylePreference(
    tx: any,
    projectId: number,
    stylePreference: NonNullable<
      CreateProjectDto['stylePreference']
    >,
  ) {
    let mode: StylePreferenceMode;

    switch (stylePreference.mode) {
      case 'whole_project':
        mode =
          StylePreferenceMode.WHOLE_PROJECT;
        break;

      case 'per_space':
        mode =
          StylePreferenceMode.PER_SPACE;
        break;

      case 'engineer_decides':
        mode =
          StylePreferenceMode.ENGINEER_DECIDES;
        break;

      default:
        throw new BadRequestException(
          `Unsupported style preference mode: ${stylePreference.mode}`,
        );
    }

    /**
     * WHOLE_PROJECT requires a style.
     */
    if (
      mode ===
        StylePreferenceMode.WHOLE_PROJECT &&
      !stylePreference.styleId
    ) {
      throw new BadRequestException(
        'styleId is required when style preference mode is whole_project',
      );
    }

    if (
      mode ===
        StylePreferenceMode.WHOLE_PROJECT &&
      stylePreference.spacePreferences?.length
    ) {
      throw new BadRequestException(
        'spacePreferences must not be provided when style preference mode is whole_project',
      );
    }

    if (
      mode ===
        StylePreferenceMode.ENGINEER_DECIDES &&
      (stylePreference.styleId ||
        stylePreference.spacePreferences?.length)
    ) {
      throw new BadRequestException(
        'styleId and spacePreferences must not be provided when style preference mode is engineer_decides',
      );
    }

    /**
     * PER_SPACE requires at least one space preference.
     */
    if (
      mode ===
        StylePreferenceMode.PER_SPACE &&
      (!stylePreference.spacePreferences ||
        stylePreference.spacePreferences.length === 0)
    ) {
      throw new BadRequestException(
        'spacePreferences are required when style preference mode is per_space',
      );
    }

    /**
     * Validate every supplied space ID.
     */
    if (
      mode ===
        StylePreferenceMode.PER_SPACE &&
      stylePreference.spacePreferences
    ) {
      const spaceIds =
        stylePreference.spacePreferences.map(
          (item) => item.spaceId,
        );

      const uniqueSpaceIds =
        new Set(spaceIds);

      if (
        uniqueSpaceIds.size !==
        spaceIds.length
      ) {
        throw new BadRequestException(
          'Duplicate spaceId values are not allowed in spacePreferences',
        );
      }

      const spaces =
        await tx.space.findMany({
          where: {
            projectId,

            id: {
              in: spaceIds,
            },
          },

          select: {
            id: true,
          },
        });

      const existingIds =
        new Set(
          spaces.map(
            (space: { id: number }) =>
              space.id,
          ),
        );

      const invalidSpaceIds =
        spaceIds.filter(
          (spaceId) =>
            !existingIds.has(
              spaceId,
            ),
        );

      if (
        invalidSpaceIds.length > 0
      ) {
        throw new BadRequestException({
          message:
            'One or more space IDs do not belong to this project',
          invalidSpaceIds,
        });
      }

      /**
       * Every actual Space should receive a style preference
       * when mode = PER_SPACE.
       */
      const projectSpaces =
        await tx.space.findMany({
          where: {
            projectId,
          },
          select: {
            id: true,
          },
        });

      const projectSpaceIds =
        new Set<number>(
          projectSpaces.map(
            (space: { id: number }) =>
              space.id,
          ),
        );

      const missingStyleSpaceIds =
        Array.from(projectSpaceIds).filter(
          (spaceId) =>
            !uniqueSpaceIds.has(
              spaceId,
            ),
        );

      if (
        missingStyleSpaceIds.length > 0
      ) {
        throw new BadRequestException({
          message:
            'Every project space must have a style preference when mode is per_space',
          missingStyleSpaceIds,
        });
      }
    }

    /**
     * Create/update project-level preference.
     */
    const projectStylePreference =
      await tx.projectStylePreference.upsert(
        {
          where: {
            projectId,
          },

          update: {
            mode,

            styleId:
              stylePreference.styleId,

            styleName:
              stylePreference.styleName,

            notes:
              stylePreference.notes,
          },

          create: {
            projectId,

            mode,

            styleId:
              stylePreference.styleId,

            styleName:
              stylePreference.styleName,

            notes:
              stylePreference.notes,
          },
        },
      );

    /**
     * Clear previous per-space preferences.
     *
     * This is safe for all modes.
     */
    await tx.spaceStylePreference.deleteMany({
      where: {
        projectStylePreferenceId:
          projectStylePreference.id,
      },
    });

    /**
     * Create new per-space preferences.
     */
    if (
      mode ===
        StylePreferenceMode.PER_SPACE &&
      stylePreference.spacePreferences
    ) {
      await tx.spaceStylePreference.createMany({
        data:
          stylePreference.spacePreferences.map(
            (spacePreference) => ({
              projectStylePreferenceId:
                projectStylePreference.id,

              spaceId:
                spacePreference.spaceId,

              styleId:
                spacePreference.styleId,

              styleName:
                spacePreference.styleName,

              notes:
                spacePreference.notes,
            }),
          ),
      });
    }
  }
}