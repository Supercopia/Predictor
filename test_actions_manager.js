const { manager } = require('./src/actions_manager');

console.log('Initial actions:', Object.keys(manager.getActions()));

// Test adding a new action
console.log('\nAdding new action "Climb Mountain"...');
manager.addAction('Climb Mountain', {
    time: 4,
    location: 'Volcano',
    locationRequirement: 'Volcano',
    extraConsumption: {
        air: 0.5
    }
});

// Test modifying an existing action
console.log('\nModifying "Wait" action...');
manager.modifyAction('Wait', {
    time: 2,
    description: 'Rest and recover'
});

// Test removing an action
console.log('\nRemoving "Take Air Tank" action...');
manager.removeAction('Take Air Tank');

console.log('\nFinal actions:', Object.keys(manager.getActions()));
console.log('\nModified Wait action:', manager.getActions()['Wait']);
console.log('\nNew Climb Mountain action:', manager.getActions()['Climb Mountain']);
