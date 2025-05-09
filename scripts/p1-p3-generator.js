/*
This file is to be ran as a node script, it creates a 7 row 3 column layout of all P1 items into P2.
 */
const tiers = require( '../public/json/evePi/tiers.json' );
const planetRecipes = require( '../public/json/evePi/planetRecipes.json');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const ccu = `ccu${args[0]}-`

const baseFile = fs.readFileSync( `public/json/evePi/p1-p3-x2-${ccu}base.json` );
const titlePrefix = `Factory-1-3.${ccu.replace('-', '')}.`;

// A list of items to replace.
const replacements = {
	p3Name: "Camera Drones",
	p3product: "2345",
	p2product1: "9830",
	p2product2: "3697",
	p2product1input1: "2389",
	p2product1input2: "2390",
	p2product2input1: "2392",
	p2product2input2: "9828"
};

let content = baseFile.toString();
for ( const [k,v] of Object.entries( replacements ) ) {
	content = content.replace( new RegExp( v, 'g' ), k );
}

tiers.P3.forEach( ( product ) => {
	let output = content;
	const schematic = planetRecipes.find( recipe => recipe.name === product );

	if ( ! schematic?.name || schematic.requireTypeID.length > 2 ) {
		return;
	}

	output = output.replace( new RegExp( 'p3Name', 'g' ), schematic.name );
	output = output.replace( new RegExp( 'p3product', 'g' ), schematic.typeID );

	let p = 1;
	schematic.requireTypeID.forEach( ( p2 ) => {

		let i=1;
		const p2Product = planetRecipes.find( r => r.typeID === p2 );
		output = output.replace( new RegExp( new RegExp( `p2product${p}(?![a-zA-Z0-9_])` ), 'g' ), p2Product.typeID );

		p2Product.requireTypeID.forEach( p1 => {
			const p1Product = planetRecipes.find( r => r.typeID === p1 );
			output = output.replace( new RegExp( `p2product${p}input${i}`, 'g' ), p1Product.typeID );
			i++;
		} )
		p++;
	} )

	const fn = titlePrefix + product + '.json';
	fs.writeFileSync(
		fn.replaceAll(' ', '-' ).replaceAll(',', '.' ),
		output
	);
} )

