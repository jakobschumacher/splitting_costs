export const calculateWeightedShares = (data) => data.map((row) => {
  const weightedRow = { ...row };
  const weightFactor = row.age * row.adjustment;

  // Apply weight factor to all cost columns
  Object.keys(row).forEach((key) => {
    if (key.startsWith('cost_')) {
      const activity = key.replace('cost_', '');
      const weightedKey = `weighted_${activity}`;
      weightedRow[weightedKey] = row[key] * weightFactor;
    }
  });

  return weightedRow;
});

export const calculateCostPerUnit = (weightedData) => {
  const costPerUnit = {};

  if (!weightedData.length) return costPerUnit;

  // Find all activities
  const activities = new Set();
  weightedData.forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (key.startsWith('weighted_')) {
        activities.add(key.replace('weighted_', ''));
      }
    });
  });

  // Calculate cost per unit for each activity
  activities.forEach((activity) => {
    const totalPaid = weightedData.reduce((sum, row) => {
      const payKey = `pay_${activity}`;
      return sum + (row[payKey] || 0);
    }, 0);

    const totalWeightedShares = weightedData.reduce((sum, row) => {
      const weightedKey = `weighted_${activity}`;
      return sum + (row[weightedKey] || 0);
    }, 0);

    costPerUnit[activity] = totalWeightedShares > 0 && totalPaid > 0
      ? totalPaid / totalWeightedShares
      : 0;
  });

  return costPerUnit;
};

export const calculateIndividualObligations = (weightedData, costPerUnit) => (
  weightedData.map((row) => {
    let shouldPay = 0;
    let alreadyPaid = 0;

    // Calculate what person should pay based on weighted shares
    Object.keys(costPerUnit).forEach((activity) => {
      const weightedKey = `weighted_${activity}`;
      const payKey = `pay_${activity}`;

      if (row[weightedKey]) {
        shouldPay += row[weightedKey] * costPerUnit[activity];
      }

      alreadyPaid += row[payKey] || 0;
    });

    return {
      element: row.name,
      shouldPay: Math.round(shouldPay * 100) / 100,
      alreadyPaid,
      netObligation: Math.round((shouldPay - alreadyPaid) * 100) / 100,
    };
  }));

export const calculateGroupObligations = (weightedData, costPerUnit) => {
  const groupData = {};

  // Aggregate by group
  weightedData.forEach((row) => {
    const groupName = row.group;

    if (!groupData[groupName]) {
      groupData[groupName] = {
        element: groupName,
        shouldPay: 0,
        alreadyPaid: 0,
        weightedShares: {},
      };
    }

    // Sum up payments
    Object.keys(row).forEach((key) => {
      if (key.startsWith('pay_')) {
        groupData[groupName].alreadyPaid += row[key] || 0;
      }
      if (key.startsWith('weighted_')) {
        const activity = key.replace('weighted_', '');
        groupData[groupName].weightedShares[activity] = (
          (groupData[groupName].weightedShares[activity] || 0) + row[key]
        );
      }
    });
  });

  // Calculate what each group should pay
  Object.keys(groupData).forEach((groupName) => {
    const group = groupData[groupName];
    Object.keys(group.weightedShares).forEach((activity) => {
      group.shouldPay += group.weightedShares[activity] * costPerUnit[activity];
    });

    group.shouldPay = Math.round(group.shouldPay * 100) / 100;
    group.netObligation = Math.round((group.shouldPay - group.alreadyPaid) * 100) / 100;
    delete group.weightedShares;
  });

  return Object.values(groupData);
};

export const calculatePaymentObligations = (data, payBy = 'individual') => {
  if (!data.length) {
    return {
      paymentMatrix: [],
      summary: {
        totalPaid: 0,
        totalShould: 0,
        activities: {},
      },
    };
  }

  // Check if group mode is selected but no group data exists
  if (payBy === 'group') {
    const hasGroupData = data.some(row => row.group && row.group.trim() !== '');
    if (!hasGroupData) {
      return {
        paymentMatrix: [],
        summary: {
          totalPaid: 0,
          totalShould: 0,
          activities: {},
        },
        warning: 'Group mode selected but no group data found. All participants appear to be individuals. Consider switching to Individual mode for proper calculation.',
      };
    }
  }

  const weightedData = calculateWeightedShares(data);
  const costPerUnit = calculateCostPerUnit(weightedData);

  const paymentMatrix = payBy === 'group'
    ? calculateGroupObligations(weightedData, costPerUnit)
    : calculateIndividualObligations(weightedData, costPerUnit);

  // Calculate summary statistics
  const totalPaid = paymentMatrix.reduce((sum, p) => sum + p.alreadyPaid, 0);
  const totalShould = paymentMatrix.reduce((sum, p) => sum + p.shouldPay, 0);

  // Activity breakdown
  const activities = {};
  Object.keys(costPerUnit).forEach((activity) => {
    const activityPaid = data.reduce((sum, row) => {
      const payKey = `pay_${activity}`;
      return sum + (row[payKey] || 0);
    }, 0);

    const totalWeightedShares = weightedData.reduce((sum, row) => {
      const weightedKey = `weighted_${activity}`;
      return sum + (row[weightedKey] || 0);
    }, 0);

    // Find who paid for this activity
    const payers = data
      .filter((row) => (row[`pay_${activity}`] || 0) > 0)
      .map((row) => row.name);
    const paidBy = payers.length > 0 ? payers.join(', ') : 'No one';

    // Calculate individual charges for this activity
    const charges = weightedData
      .filter((row) => (row[`weighted_${activity}`] || 0) > 0)
      .map((row) => ({
        person: row.name,
        amount: (row[`weighted_${activity}`] || 0) * costPerUnit[activity],
        shares: row[`weighted_${activity}`] || 0,
      }));

    activities[activity] = {
      totalPaid: activityPaid,
      totalWeightedShares: Math.round(totalWeightedShares * 100) / 100,
      costPerUnit: costPerUnit[activity],
      paidBy,
      charges,
    };
  });

  return {
    paymentMatrix,
    summary: {
      totalPaid,
      totalShould: Math.round(totalShould * 100) / 100,
      activities,
    },
  };
};
