import { StylePreferenceMode } from '../generated/prisma/client.js';
 /**
   * --------------------------------------------------------------------------
   * Submission Validation
   * --------------------------------------------------------------------------
   */
export function validateProjectForSubmission(
    project: any,
  ): string[] {
    const missingFields: string[] = [];

    /**
     * ------------------------------------------------------------------------
     * Basic project
     * ------------------------------------------------------------------------
     */
    if (
      !project.title ||
      !project.title.trim()
    ) {
      missingFields.push(
        'title',
      );
    }

    /**
     * ------------------------------------------------------------------------
     * Property
     * ------------------------------------------------------------------------
     */
    if (!project.property) {
      missingFields.push(
        'property',
      );
    } else {
      if (!project.property.propertyType) {
        missingFields.push(
          'property.propertyType',
        );
      }

      if (
        !project.property.city ||
        !project.property.city.trim()
      ) {
        missingFields.push(
          'property.city',
        );
      }

      const area =
        Number(
          project.property.areaSqm,
        );

      if (
        !Number.isFinite(area) ||
        area <= 0
      ) {
        missingFields.push(
          'property.areaSqm',
        );
      }
    }

    /**
     * ------------------------------------------------------------------------
     * Spaces
     * ------------------------------------------------------------------------
     */
    if (
      !project.spaces ||
      project.spaces.length === 0
    ) {
      missingFields.push(
        'spaces',
      );
    }

    /**
     * ------------------------------------------------------------------------
     * Location
     * ------------------------------------------------------------------------
     */
    if (!project.location) {
      missingFields.push(
        'customerLocation',
      );
    } else {
      if (
        !project.location.country ||
        !project.location.country.trim()
      ) {
        missingFields.push(
          'customerLocation.country',
        );
      }

      if (
        !project.location.city ||
        !project.location.city.trim()
      ) {
        missingFields.push(
          'customerLocation.city',
        );
      }

      if (
        !project.location.timezone ||
        !project.location.timezone.trim()
      ) {
        missingFields.push(
          'customerLocation.timezone',
        );
      }
      if (
        !project.location.phone ||
        !project.location.phone.trim()
      ) {
        missingFields.push(
          'customerLocation.phone',);
      }
    }

    /**
     * ------------------------------------------------------------------------
     * Representative
     * ------------------------------------------------------------------------
     */
    if (!project.representative) {
      missingFields.push(
        'representative',
      );
    } else {
      const representative =
        project.representative;

      if (
        representative.hasRepresentative
      ) {
        if (
          !representative.name ||
          !representative.name.trim()
        ) {
          missingFields.push(
            'representative.name',
          );
        }

        if (
          !representative.phone ||
          !representative.phone.trim()
        ) {
          missingFields.push(
            'representative.phone',
          );
        }

        if (
          !representative.relationship ||
          !representative.relationship.trim()
        ) {
          missingFields.push(
            'representative.relationship',
          );
        }

        if (
          !representative.authorizationScope ||
          !representative.authorizationScope.trim()
        ) {
          missingFields.push(
            'representative.authorizationScope',
          );
        }
      }

      /**
       * These two flags cannot contradict each other.
       */
      if (
        representative.hasRepresentative ===
        true &&
        representative.valentiaManagedDirectly ===
        true
      ) {
        missingFields.push(
          'representative.hasRepresentative / representative.valentiaManagedDirectly',
        );
      }
    }

    /**
     * ------------------------------------------------------------------------
     * Scope
     * ------------------------------------------------------------------------
     */
    if (!project.scope) {
      missingFields.push(
        'scope',
      );
    } else if (
      !project.scope.scopeType
    ) {
      missingFields.push(
        'scope.scopeType',
      );
    }

    /**
     * ------------------------------------------------------------------------
     * Budget
     * ------------------------------------------------------------------------
     */
    if (!project.budget) {
      missingFields.push(
        'budget',
      );
    } else {
      const budget =
        project.budget;

      if (!budget.budgetType) {
        missingFields.push(
          'budget.budgetType',
        );
      }

      if (
        !budget.currency ||
        !budget.currency.trim()
      ) {
        missingFields.push(
          'budget.currency',
        );
      }

      if (
        budget.budgetType ===
        'EXACT'
      ) {
        if (
          budget.exactAmount ===
          null ||
          budget.exactAmount ===
          undefined ||
          Number(
            budget.exactAmount,
          ) <= 0
        ) {
          missingFields.push(
            'budget.exactAmount',
          );
        }
      }

      if (
        budget.budgetType ===
        'RANGE'
      ) {
        const min =
          Number(
            budget.minAmount,
          );

        const max =
          Number(
            budget.maxAmount,
          );

        if (
          !Number.isFinite(min) ||
          min <= 0
        ) {
          missingFields.push(
            'budget.minAmount',
          );
        }

        if (
          !Number.isFinite(max) ||
          max <= 0
        ) {
          missingFields.push(
            'budget.maxAmount',
          );
        }

        if (
          Number.isFinite(min) &&
          Number.isFinite(max) &&
          min > max
        ) {
          missingFields.push(
            'budget.minAmount <= budget.maxAmount',
          );
        }
      }
    }

    /**
     * ------------------------------------------------------------------------
     * Timeline
     * ------------------------------------------------------------------------
     */
    if (!project.timeline) {
      missingFields.push(
        'timeline',
      );
    } else {
      const timeline =
        project.timeline;

      if (
        !timeline.deadlineType
      ) {
        missingFields.push(
          'timeline.deadlineType',
        );
      }

      if (
        timeline.deadlineType ===
        'SPECIFIC_DATE'
      ) {
        if (
          !timeline.targetDate
        ) {
          missingFields.push(
            'timeline.targetDate',
          );
        }
      }

      if (
        timeline.deadlineType ===
        'DURATION'
      ) {
        if (
          !timeline.durationDescription ||
          !timeline.durationDescription.trim()
        ) {
          missingFields.push(
            'timeline.durationDescription',
          );
        }
      }
    }

    /**
     * ------------------------------------------------------------------------
     * Style Preference
     * ------------------------------------------------------------------------
     */
    if (
      !project.stylePreference
    ) {
      missingFields.push(
        'stylePreference',
      );
    } else {
      const stylePreference =
        project.stylePreference;

      /**
       * Whole project requires a style.
       */
      if (
        stylePreference.mode ===
        StylePreferenceMode.WHOLE_PROJECT
      ) {
        if (
          !stylePreference.styleId
        ) {
          missingFields.push(
            'stylePreference.styleId',
          );
        }
      }

      /**
       * Per-space requires every actual project Space
       * to have one style preference.
       */
      if (
        stylePreference.mode ===
        StylePreferenceMode.PER_SPACE
      ) {
        const preferences =
          stylePreference.spacePreferences ??
          [];

        const preferenceSpaceIds =
          new Set(
            preferences.map(
              (preference: {
                spaceId: number;
              }) =>
                preference.spaceId,
            ),
          );

        for (
          const space of project.spaces ?? []
        ) {
          if (
            !preferenceSpaceIds.has(
              space.id,
            )
          ) {
            missingFields.push(
              `stylePreference.spacePreferences[spaceId=${space.id}]`,
            );
          }
        }
      }

      /**
       * ENGINEER_DECIDES intentionally requires no styleId.
       */
    }

    return missingFields;
  }
