// frontend/src/categorizationPage/rulesManager.js
console.log('rulesManager.js loaded');

// Add a new rule via backendCommunications.js
async function addNewRule(rule) {
  console.log('Adding new rule:', rule);
  try {
    const result = await window.addNewRule(rule);
    if (result.success) {
      console.log('Rule added successfully via backendCommunications:', result.data);
    } else {
      console.log('Failed to add rule:', result.message);
    }
    return result;
  } catch (error) {
    console.error('Error in rulesManager.addNewRule:', error);
    return { success: false, message: error.message };
  }
}

// Delete a rule via backendCommunications.js
async function deleteRule(ruleId) {
  console.log('Deleting rule with ID:', ruleId);
  try {
    const result = await window.deleteRule(ruleId);
    if (result.success) {
      console.log('Rule deleted successfully via backendCommunications:', { id: ruleId });
    } else {
      console.log('Failed to delete rule:', result.message);
    }
    return result;
  } catch (error) {
    console.error('Error in rulesManager.deleteRule:', error);
    return { success: false, message: error.message };
  }
}

// Expose functions to window.rulesManager
window.rulesManager = {
  addNewRule,
  deleteRule
};