"""
Generates a synthetic labeled dataset of free-text search queries mapped to
ServLink's 8 service categories. There is no real user query log to train on
yet (the platform hasn't launched), so queries are built by combining phrase
templates with slot values (locations, issues, home types, item names, and
colloquial synonyms) to approximate realistic phrasing variety, including
symptom-based/indirect descriptions rather than just category keywords.

Output: data/queries.csv with columns [text, category]
"""
import csv
import random
from collections import Counter

random.seed(42)

LOCATIONS = [
    "Colombo", "Colombo 3", "Colombo 5", "Colombo 7", "Nugegoda", "Dehiwala",
    "Mount Lavinia", "Kotte", "Rajagiriya", "Wattala", "Negombo", "Kandy",
    "Galle", "Maharagama", "Kelaniya", "Moratuwa", "the city center", "town",
]
HOME_TYPES = ["house", "apartment", "annex", "room", "flat", "villa", "studio", "boarding place"]
BEDS = ["1", "2", "3", "4"]
PRICES = ["50000", "75000", "100000", "120000"]

ELECTRICAL_ISSUES = [
    "a short circuit", "a tripping breaker", "a burnt socket", "faulty wiring",
    "a broken switch board", "no power in one room", "a fuse that keeps blowing",
    "flickering lights", "a fan that won't turn on", "an MCB that keeps tripping",
    "a plug that sparks when I use it", "the aircon plug sparking",
    "an electric shock from the switch", "the meter box making noise",
    "downlights that won't switch off", "a burning smell from the plug point",
]
ELECTRICAL_ITEMS = [
    "a ceiling fan", "new light points", "an inverter", "a generator",
    "extra sockets", "a solar panel", "a smart switch", "an extension board",
    "downlights", "a new electric meter", "an air conditioner circuit",
]

PLUMBING_ISSUES = [
    "a leaking pipe", "a blocked drain", "a running toilet", "a dripping tap",
    "low water pressure", "a burst pipe", "a clogged sink", "a broken water tank valve",
    "water dripping from the ceiling", "an overflowing cistern", "a broken flush tank",
    "a leaking geyser", "a faulty shower head", "a smelly sewer line",
    "a blocked gutter", "no hot water in the shower",
]
HOUSE_SPOTS = ["the kitchen", "the bathroom", "the toilet", "under the sink", "the balcony", "the garden tap", "the roof", "the ceiling"]

CARPENTRY_ISSUES = [
    "a door that won't close", "a broken cabinet hinge", "a wobbly table",
    "a squeaky wardrobe door", "a cracked wooden panel", "a broken drawer",
    "loose hinges on the almirah", "a shelf that collapsed", "termite damage on the cupboard",
    "a wardrobe door that won't shut", "a broken chair leg", "warped window frames",
]
CARPENTRY_ITEMS = [
    "a wardrobe", "kitchen cabinets", "a bookshelf", "a bed frame", "a study table",
    "window frames", "an almirah", "a cupboard", "a shoe rack", "a TV unit",
]

CLEANING_TERMS = [
    "filthy", "spotless", "grimy", "dusty", "full of mould", "stained", "messy",
    "covered in dust", "smelling musty", "left in a mess by the previous tenants",
]
CLEANING_ITEMS = ["sofa", "carpet", "curtains", "windows", "kitchen", "bathroom tiles", "upholstery"]

INTERNET_TERMS = [
    "buffering constantly", "very slow", "keeps disconnecting", "freezing during calls",
    "not reaching the back rooms", "showing no signal", "dropping every few minutes",
]

PAINT_TERMS = [
    "faded", "patchy", "peeling", "cracked", "discoloured", "chipped", "damp-stained",
]

TEMPLATES = {
    "house-rental": [
        "looking for a {bed} bedroom {home} to rent in {loc}",
        "need a house for rent near {loc}",
        "want to rent an apartment in {loc} budget rs {price}",
        "searching for {home} rental in {loc}",
        "any {bed}br house available for rent in {loc}",
        "need accommodation in {loc} for a family",
        "looking to lease a {home} in {loc}",
        "vacant house for rent {loc}",
        "furnished {home} for rent {loc}",
        "unfurnished {bed} bedroom house {loc} for rent",
        "monthly rental {home} {loc}",
        "need to find a place to stay in {loc}",
        "house for rent close to school in {loc}",
        "small {home} for rent single person {loc}",
        "family looking to rent {bed} bedroom house {loc}",
        "newly married couple looking for a small place close to {loc}",
        "need a boarding place near {loc} for work",
        "landlord looking to lease out {home} in {loc}",
        "need a tenancy agreement for a {home} in {loc}",
        "relocating for work need a {home} in {loc}",
        "student looking for a room to rent {loc}",
        "need a place with parking to rent {loc}",
        "looking for a {home} close to the city center",
        "deposit and monthly rent for {home} in {loc}",
    ],
    "electrician": [
        "need an electrician to fix {issue}",
        "socket not working need repair",
        "house wiring problem {issue}",
        "looking for someone to install {item}",
        "power keeps tripping need electrician",
        "fan not working need electrical repair",
        "need certified electrician for {issue}",
        "inverter installation help needed",
        "electrician needed urgently for {issue}",
        "want to install {item} at home",
        "no electricity in the kitchen need help",
        "need wiring rewired whole house",
        "switch board sparking need electrician fast",
        "need someone to check {issue}",
        "looking for electrical repair service",
        "my aircon plug keeps sparking whenever I turn it on",
        "got an electric shock touching the switch need help",
        "the meter box is making a buzzing noise",
        "need someone to look at {issue}",
        "downlights won't turn off even from the switch",
        "smell of burning near the plug point",
        "need help setting up a backup power system",
        "circuit breaker trips every time I use the kettle",
    ],
    "plumber": [
        "leaking pipe under {spot}",
        "blocked drain in {spot}",
        "need plumber to fix {issue}",
        "toilet flush not working",
        "water heater installation needed",
        "tap leaking need repair",
        "bathroom fitting issue plumber needed",
        "no water pressure need plumber",
        "need someone to fix {issue}",
        "pipe burst in {spot} need urgent plumber",
        "water tank leaking need repair",
        "need plumber to install new tap in {spot}",
        "drainage problem need plumbing service",
        "sink clogged in {spot}",
        "need licensed plumber for {issue}",
        "water is dripping from the ceiling below {spot}",
        "geyser leaking need repair",
        "shower head not working properly",
        "sewer line smells bad need plumber",
        "gutter overflowing after rain need fixing",
        "need someone to sort out {issue}",
        "no hot water coming from the shower",
        "cistern keeps running need repair",
    ],
    "movers": [
        "need movers to shift house from {loc} to {loc2}",
        "looking for transport service to move furniture",
        "office relocation need moving company",
        "need lorry for moving house",
        "packing and moving service needed",
        "shifting to new house need movers",
        "need help moving furniture across town",
        "relocating from {loc} to {loc2} need transport",
        "need packers and movers for {bed} bedroom house",
        "moving company needed for home relocation",
        "need a lorry and workers to shift items",
        "house shifting service {loc}",
        "need transport for moving to {loc2}",
        "i'm moving from my rented flat to a new place next week need a van",
        "need help loading and unloading furniture for a move",
        "cross country move need reliable transport",
        "need boxes and packing help before we shift house",
        "moving to {loc2} soon need a moving truck",
    ],
    "cleaner": [
        "need deep cleaning service for {home}",
        "looking for house cleaner in {loc}",
        "move-in cleaning needed before shifting",
        "need someone to clean my apartment weekly",
        "office cleaning service required",
        "sofa and carpet cleaning needed",
        "post construction cleaning needed",
        "need cleaning service before moving out {loc}",
        "regular home cleaning service {loc}",
        "need deep clean for {bed} bedroom house",
        "looking for reliable cleaning staff",
        "need eco friendly cleaning service {loc}",
        "this place is {cleaning_term} after the tenants left need it spotless before we move in",
        "the {cleaning_item} is {cleaning_term} need it cleaned",
        "need someone to sanitize the whole house",
        "place is {cleaning_term} need thorough cleaning",
        "need window cleaning service {loc}",
        "post party mess need cleanup service",
    ],
    "carpenter": [
        "need carpenter for {issue}",
        "custom wardrobe needed",
        "door not closing properly need carpenter",
        "furniture repair {item}",
        "kitchen cabinet installation needed",
        "need wood work done for {item}",
        "need carpenter to build {item}",
        "wardrobe door repair needed",
        "need custom furniture made {item}",
        "carpenter needed to fix {issue}",
        "need someone to install {item}",
        "table leg broken need carpenter",
        "the hinges on my almirah are loose and one shelf collapsed",
        "need someone to fix {issue}",
        "termite damage on the {item} need repair",
        "need polish and varnish work on {item}",
        "cupboard door won't shut properly need fixing",
        "need custom made {item} for the new house",
    ],
    "internet-setup": [
        "need broadband installation {loc}",
        "wifi router setup needed",
        "fibre connection installation",
        "internet not working need technician",
        "need help setting up home network",
        "router configuration needed",
        "need new fibre connection {loc}",
        "wifi signal weak need technician",
        "need internet installed in new house {loc}",
        "broadband not working need repair",
        "need help extending wifi range at home",
        "looking for isp technician {loc}",
        "my zoom calls keep {internet_term} think the connection speed is bad",
        "internet connection {internet_term} need a technician to check",
        "need wifi extender installed for the whole house",
        "video calls {internet_term} need better internet setup",
        "need help switching internet provider {loc}",
    ],
    "painter": [
        "need painter for {home}",
        "wall painting service needed {loc}",
        "exterior house painting required",
        "need to repaint bedroom walls",
        "painting contractor needed for office",
        "need painter to paint {bed} bedroom house",
        "interior wall painting needed {loc}",
        "need to repaint fence and gate",
        "waterproof exterior paint job needed",
        "looking for painting service {loc}",
        "need touch up painting for {home}",
        "the outside walls look {paint_term} want a fresh coat",
        "paint is {paint_term} on the ceiling need repainting",
        "need primer and paint work done for {home}",
        "walls are {paint_term} from the rain need repainting",
        "need a colour change for the living room walls",
    ],
}


def fill(template: str) -> str:
    return template.format(
        loc=random.choice(LOCATIONS),
        loc2=random.choice(LOCATIONS),
        home=random.choice(HOME_TYPES),
        bed=random.choice(BEDS),
        price=random.choice(PRICES),
        issue=random.choice(ELECTRICAL_ISSUES + PLUMBING_ISSUES + CARPENTRY_ISSUES),
        item=random.choice(ELECTRICAL_ITEMS + CARPENTRY_ITEMS),
        spot=random.choice(HOUSE_SPOTS),
        cleaning_term=random.choice(CLEANING_TERMS),
        cleaning_item=random.choice(CLEANING_ITEMS),
        internet_term=random.choice(INTERNET_TERMS),
        paint_term=random.choice(PAINT_TERMS),
    )


def main():
    rows = []
    per_template_repeats = 12
    for category, templates in TEMPLATES.items():
        seen = set()
        for template in templates:
            attempts = 0
            generated = 0
            while generated < per_template_repeats and attempts < per_template_repeats * 4:
                attempts += 1
                text = fill(template)
                if text in seen:
                    continue
                seen.add(text)
                rows.append((text, category))
                generated += 1

    random.shuffle(rows)
    with open("data/queries.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["text", "category"])
        writer.writerows(rows)

    print(f"Generated {len(rows)} rows across {len(TEMPLATES)} categories")
    print(Counter(c for _, c in rows))


if __name__ == "__main__":
    main()
