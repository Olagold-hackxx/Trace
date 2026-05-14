"""
Synthetic Nigerian informal economy data for the job matching prototype.

Strategy: Option B — handcrafted templates, no scraping.
  - ~40 handcrafted job postings expanded to 100 via parameterisation
  - 200 worker profiles, 20% cold-start (0 gigs, no rating)
  - Lagos neighborhood-level geography (18 neighbourhoods with real centroids)
  - Fixed seed = 42 everywhere — byte-identical output every run

Eval cases (committed to eval_cases.json for demo use):
  1. job_001 — Welder, Lekki (happy path: nearest skilled welder wins)
  2. job_pidgin_gen — Pidgin generator post, Yaba (multilingual retrieval)
  3. job_domestic_lekki — Domestic worker, Lekki (rate + geography reranking)
"""

from __future__ import annotations

import json
import random as _random
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd

SEED = 42
_rng  = np.random.default_rng(SEED)
_random.seed(SEED)

# ─── Geography ────────────────────────────────────────────────────────────────

# Lagos neighbourhood centroids (real coordinates)
LAGOS_NEIGHBORHOODS: dict[str, tuple[float, float]] = {
    'Lekki Phase 1':   (6.4698, 3.5852),
    'Victoria Island': (6.4281, 3.4219),
    'Ikeja':           (6.5958, 3.3389),
    'Surulere':        (6.5038, 3.3558),
    'Yaba':            (6.5147, 3.3796),
    'Ikorodu':         (6.6194, 3.5076),
    'Festac':          (6.4618, 3.2807),
    'Ajah':            (6.4698, 3.6118),
    'Agege':           (6.6178, 3.3215),
    'Mushin':          (6.5292, 3.3511),
    'Oshodi':          (6.5551, 3.3511),
    'Apapa':           (6.4538, 3.3671),
    'Isolo':           (6.5248, 3.3301),
    'Lagos Island':    (6.4550, 3.3841),
    'Alimosho':        (6.6107, 3.2532),
    'Maryland':        (6.5672, 3.3605),
    'Gbagada':         (6.5510, 3.3790),
    'Ojota':           (6.5958, 3.3956),
}

# Other city centroids (neighbourhood-level not needed for prototype)
OTHER_CITIES: dict[str, tuple[float, float]] = {
    'Abuja — Wuse 2':      (9.0579, 7.4941),
    'Abuja — Garki':       (9.0417, 7.4686),
    'Abuja — Maitama':     (9.0812, 7.4867),
    'Port Harcourt GRA':   (4.8030, 7.0134),
    'Port Harcourt Trans-Amadi': (4.8415, 7.0286),
    'Kano City Centre':    (12.0022, 8.5920),
    'Ibadan — Ring Road':  (7.3776, 3.9470),
    'Enugu GRA':           (6.4449, 7.5059),
    'Aba':                 (5.1066, 7.3661),
    'Benin City':          (6.3350, 5.6270),
}

ALL_LOCATIONS: dict[str, tuple[float, float]] = {**LAGOS_NEIGHBORHOODS, **OTHER_CITIES}

# Worker distribution: Lagos-heavy (reflects where informal workers cluster)
_LAGOS_WEIGHT = 0.60
_LAGOS_HOODS  = list(LAGOS_NEIGHBORHOODS.keys())
_OTHER_LOCS   = list(OTHER_CITIES.keys())


# ─── Handcrafted job postings ─────────────────────────────────────────────────

JOBS_HANDCRAFTED = [
    # ══ WELDING ══════════════════════════════════════════════════════════════
    {
        'job_id': 'job_001',
        'title': 'Welder needed for security gate fabrication',
        'description': (
            'We need an experienced welder to fabricate a security gate and perimeter '
            'fence for our compound. Mild steel work, own welding machine required. '
            'Minimum 5 years experience. Job site in Lekki Phase 1.'
        ),
        'category': 'welding',
        'location_name': 'Lekki Phase 1',
        'budget_naira': 15000,
        'duration_estimate': '3 days',
        'posted_language': 'en',
        'employer_verified': True,
    },
    {
        'job_id': 'job_002',
        'title': 'Welder wey sabi stainless steel',
        'description': (
            'I need welder wey sabi work stainless steel well well for kitchen equipment. '
            'Na Wuse 2 Abuja. Work go take two days, material dey available already.'
        ),
        'category': 'welding',
        'location_name': 'Abuja — Wuse 2',
        'budget_naira': 15000,
        'duration_estimate': '2 days',
        'posted_language': 'pcm',
        'employer_verified': False,
    },
    {
        'job_id': 'job_003',
        'title': 'Structural welder for warehouse roof trusses',
        'description': (
            'Ongoing construction project in Trans-Amadi requires an experienced structural '
            'welder for roof trusses and steel columns. Long-term engagement available if work is neat.'
        ),
        'category': 'welding',
        'location_name': 'Port Harcourt Trans-Amadi',
        'budget_naira': 14000,
        'duration_estimate': '2 weeks',
        'posted_language': 'en',
        'employer_verified': True,
    },
    {
        'job_id': 'job_004',
        'title': 'Welder for aluminum window frames',
        'description': (
            'Building contractor for Gbagada needs a skilled aluminium welder for window '
            'and door frame fabrication on a new storey building. Speed and neatness required.'
        ),
        'category': 'welding',
        'location_name': 'Gbagada',
        'budget_naira': 12000,
        'duration_estimate': '5 days',
        'posted_language': 'en',
        'employer_verified': False,
    },
    # ══ GENERATOR / ELECTRICAL ════════════════════════════════════════════════
    {
        'job_id': 'job_005',
        'title': 'Generator technician — Mikano 20KVA fault',
        'description': (
            'Our 20KVA Mikano diesel generator has been faulty for two days. '
            'Need a technician who understands AVR systems and diesel engines. '
            'Same-day fix preferred. Ikeja.'
        ),
        'category': 'generator_repair',
        'location_name': 'Ikeja',
        'budget_naira': 10000,
        'duration_estimate': '1 day',
        'posted_language': 'en',
        'employer_verified': True,
    },
    {
        'job_id': 'job_006',
        'title': 'Person wey sabi fix gen for my shop for Yaba',
        'description': (
            'My FG Wilson generator dey give problem since morning. '
            'E no dey start at all. I need technician wey sabi diesel gen come check am for Yaba. '
            'Make e come with diagnostic tools.'
        ),
        'category': 'generator_repair',
        'location_name': 'Yaba',
        'budget_naira': 8000,
        'duration_estimate': '1 day',
        'posted_language': 'pcm',
        'employer_verified': False,
    },
    {
        'job_id': 'job_007',
        'title': 'Solar panel installation technician',
        'description': (
            'We require a technician experienced in solar panel installation and '
            'inverter setup for a 5KVA hybrid system. Port Harcourt GRA. '
            'Must have completed at least 10 solar installations.'
        ),
        'category': 'electrical',
        'location_name': 'Port Harcourt GRA',
        'budget_naira': 18000,
        'duration_estimate': '2 days',
        'posted_language': 'en',
        'employer_verified': True,
    },
    {
        'job_id': 'job_008',
        'title': 'Electrician for shop wiring — Wuse 2',
        'description': (
            'Need electrician to wire my new boutique in Wuse 2. '
            'Three-phase connection dey available. Work go take two days max.'
        ),
        'category': 'electrical',
        'location_name': 'Abuja — Wuse 2',
        'budget_naira': 8000,
        'duration_estimate': '2 days',
        'posted_language': 'pcm',
        'employer_verified': False,
    },
    # ══ TAILORING ════════════════════════════════════════════════════════════
    {
        'job_id': 'job_009',
        'title': 'Tailor for corporate staff uniforms',
        'description': (
            'We need an experienced tailor to sew 50 pieces of office uniforms '
            '(trousers and shirts) for our staff by month end. Surulere, Lagos.'
        ),
        'category': 'tailoring',
        'location_name': 'Surulere',
        'budget_naira': 7000,
        'duration_estimate': '10 days',
        'posted_language': 'en',
        'employer_verified': True,
    },
    {
        'job_id': 'job_010',
        'title': 'Fashion designer for aso-ebi — owambe next Saturday',
        'description': (
            'I wan sew aso-ebi for my owambe. Need designer wey sabi Ankara style '
            'very well, can deliver in one week. Lagos Island area, fabric don ready.'
        ),
        'category': 'tailoring',
        'location_name': 'Lagos Island',
        'budget_naira': 6000,
        'duration_estimate': '5 days',
        'posted_language': 'pcm',
        'employer_verified': False,
    },
    {
        'job_id': 'job_011',
        'title': 'Kaftans da agbada specialist a Kano',
        'description': (
            'Ina neman mai saka kaftans da agbada mai kyau. '
            'Aiki zai dauki makonni biyu a Kano City Centre. Kayan aiki sun shirya.'
        ),
        'category': 'tailoring',
        'location_name': 'Kano City Centre',
        'budget_naira': 5000,
        'duration_estimate': '14 days',
        'posted_language': 'ha',
        'employer_verified': False,
    },
    # ══ PLUMBING ═════════════════════════════════════════════════════════════
    {
        'job_id': 'job_012',
        'title': 'Plumber for bathroom renovation — Lekki',
        'description': (
            'Need a skilled plumber to renovate two bathrooms. '
            'Work includes replacing old pipes, fixing cisterns, and re-routing drainage. '
            'Lekki Phase 1.'
        ),
        'category': 'plumbing',
        'location_name': 'Lekki Phase 1',
        'budget_naira': 9000,
        'duration_estimate': '4 days',
        'posted_language': 'en',
        'employer_verified': True,
    },
    {
        'job_id': 'job_013',
        'title': 'Emergency plumber — pipe don burst for Mushin',
        'description': (
            'Pipe burst for my building, water dey run everywhere. '
            'Need emergency plumber to come Mushin area immediately. I go pay double for fast response.'
        ),
        'category': 'plumbing',
        'location_name': 'Mushin',
        'budget_naira': 15000,
        'duration_estimate': '1 day',
        'posted_language': 'pcm',
        'employer_verified': False,
    },
    # ══ CARPENTRY ════════════════════════════════════════════════════════════
    {
        'job_id': 'job_014',
        'title': 'Carpenter for office furniture — Victoria Island',
        'description': (
            'We need a skilled carpenter to build 10 office desks and bookshelves '
            'for our new office in Victoria Island. Hardwood preferred, portfolio required.'
        ),
        'category': 'carpentry',
        'location_name': 'Victoria Island',
        'budget_naira': 11000,
        'duration_estimate': '7 days',
        'posted_language': 'en',
        'employer_verified': True,
    },
    {
        'job_id': 'job_015',
        'title': 'Carpenter wey go build kitchen cabinet for Enugu',
        'description': (
            'I need good carpenter to build kitchen cabinet and wardrobe for my apartment '
            'in Enugu GRA. Material don dey available, just bring your skill and tools.'
        ),
        'category': 'carpentry',
        'location_name': 'Enugu GRA',
        'budget_naira': 8000,
        'duration_estimate': '5 days',
        'posted_language': 'pcm',
        'employer_verified': False,
    },
    # ══ PAINTING ══════════════════════════════════════════════════════════════
    {
        'job_id': 'job_016',
        'title': 'House painter — 4-bedroom duplex Ajah',
        'description': (
            'We need experienced painters to paint our 4-bedroom duplex in Ajah. '
            'Interior and exterior. Quality finish required, no drips, clean edges.'
        ),
        'category': 'painting',
        'location_name': 'Ajah',
        'budget_naira': 7500,
        'duration_estimate': '6 days',
        'posted_language': 'en',
        'employer_verified': False,
    },
    {
        'job_id': 'job_017',
        'title': 'Painter wey sabi POP and texture finish — Abuja',
        'description': (
            'Need painter for office space Maitama Abuja. POP ceiling dey, '
            'texture wall finish needed. Must have portfolio to show before we start.'
        ),
        'category': 'painting',
        'location_name': 'Abuja — Maitama',
        'budget_naira': 9000,
        'duration_estimate': '4 days',
        'posted_language': 'pcm',
        'employer_verified': True,
    },
    # ══ TILING ═══════════════════════════════════════════════════════════════
    {
        'job_id': 'job_018',
        'title': 'Professional tiler for 5-bedroom house finishing',
        'description': (
            'We need a professional tiler for a 5-bedroom house finishing in Trans-Amadi. '
            'Spanish and Italian tiles. Neatness and attention to detail are non-negotiable.'
        ),
        'category': 'tiling',
        'location_name': 'Port Harcourt Trans-Amadi',
        'budget_naira': 10000,
        'duration_estimate': '8 days',
        'posted_language': 'en',
        'employer_verified': True,
    },
    # ══ DOMESTIC SERVICES ════════════════════════════════════════════════════
    {
        'job_id': 'job_019',
        'title': 'Domestic worker — Lekki Phase 1, full-time live-out',
        'description': (
            'We are looking for a reliable, experienced domestic worker for our home '
            'in Lekki Phase 1. Full-time, Monday to Saturday. Duties include cooking, '
            'cleaning, laundry, and light childcare. ₦88,000/month (≈ ₦4,000/day).'
        ),
        'category': 'cleaning',
        'location_name': 'Lekki Phase 1',
        'budget_naira': 4000,
        'duration_estimate': 'ongoing',
        'posted_language': 'en',
        'employer_verified': True,
    },
    {
        'job_id': 'job_020',
        'title': 'House cleaner twice a week — Ikeja GRA',
        'description': (
            'Looking for a trustworthy house cleaner to come twice a week to our '
            '3-bedroom apartment in Ikeja GRA. Morning shift, 4 hours per visit.'
        ),
        'category': 'cleaning',
        'location_name': 'Ikeja',
        'budget_naira': 4000,
        'duration_estimate': 'ongoing',
        'posted_language': 'en',
        'employer_verified': False,
    },
    # ══ DRIVING / LOGISTICS ══════════════════════════════════════════════════
    {
        'job_id': 'job_021',
        'title': 'Dispatch rider for e-commerce deliveries — Lagos',
        'description': (
            'Fast-growing e-commerce startup needs dispatch rider with own reliable bike '
            'for same-day delivery across Lagos. Must know Lagos roads inside out. '
            'Oshodi-based operations.'
        ),
        'category': 'driving',
        'location_name': 'Oshodi',
        'budget_naira': 6000,
        'duration_estimate': 'ongoing',
        'posted_language': 'en',
        'employer_verified': True,
    },
    {
        'job_id': 'job_022',
        'title': 'Driver wey know Abuja road well well',
        'description': (
            'Need personal driver, Monday to Saturday, 7am to 7pm. '
            'Must get valid driver license and know every corner of Abuja well. '
            'Punctuality and good attitude compulsory.'
        ),
        'category': 'driving',
        'location_name': 'Abuja — Garki',
        'budget_naira': 7000,
        'duration_estimate': 'ongoing',
        'posted_language': 'pcm',
        'employer_verified': True,
    },
    {
        'job_id': 'job_023',
        'title': 'Truck driver for oil field logistics — Port Harcourt',
        'description': (
            'Logistics company needs experienced truck driver for inter-state goods movement. '
            'Class E license required. Minimum 3 years experience on articulated vehicles.'
        ),
        'category': 'driving',
        'location_name': 'Port Harcourt GRA',
        'budget_naira': 10000,
        'duration_estimate': 'ongoing',
        'posted_language': 'en',
        'employer_verified': True,
    },
    # ══ SECURITY ═════════════════════════════════════════════════════════════
    {
        'job_id': 'job_024',
        'title': 'Night security guard for warehouse — Apapa',
        'description': (
            'We need a vigilant security guard for our goods warehouse in Apapa. '
            'Night duty, 8pm to 6am. Prior security experience and CCTV familiarity required.'
        ),
        'category': 'security',
        'location_name': 'Apapa',
        'budget_naira': 4500,
        'duration_estimate': 'ongoing',
        'posted_language': 'en',
        'employer_verified': True,
    },
    # ══ CATERING ═════════════════════════════════════════════════════════════
    {
        'job_id': 'job_025',
        'title': 'Cook for staff canteen — 30 people daily',
        'description': (
            'Company in Maryland Lagos needs experienced cook to prepare lunch '
            'for 30 staff members every weekday. Must know Nigerian dishes and continental options.'
        ),
        'category': 'catering',
        'location_name': 'Maryland',
        'budget_naira': 8000,
        'duration_estimate': 'ongoing',
        'posted_language': 'en',
        'employer_verified': True,
    },
    {
        'job_id': 'job_026',
        'title': 'Suya chef wey know the work — Kano',
        'description': (
            'I dey open suya spot for Kano. Need chef wey sabi suya, tsire and kilishi '
            'preparation well well. Accommodation go dey available for right person.'
        ),
        'category': 'catering',
        'location_name': 'Kano City Centre',
        'budget_naira': 5500,
        'duration_estimate': 'ongoing',
        'posted_language': 'pcm',
        'employer_verified': False,
    },
    # ══ ELECTRONICS REPAIR ═══════════════════════════════════════════════════
    {
        'job_id': 'job_027',
        'title': 'Phone technician — Ikeja Computer Village',
        'description': (
            'Busy repair shop in Ikeja Computer Village needs a skilled phone technician. '
            'Must handle screen replacement, motherboard repair, and software flashing daily.'
        ),
        'category': 'electronics_repair',
        'location_name': 'Ikeja',
        'budget_naira': 9000,
        'duration_estimate': 'ongoing',
        'posted_language': 'en',
        'employer_verified': True,
    },
    # ══ HVAC ═════════════════════════════════════════════════════════════════
    {
        'job_id': 'job_028',
        'title': 'AC technician for office servicing — Maitama',
        'description': (
            'Need AC technician to service 6 split units in our office building in Maitama. '
            'Gas recharge may be needed. Must have own gauges and tools.'
        ),
        'category': 'hvac',
        'location_name': 'Abuja — Maitama',
        'budget_naira': 12000,
        'duration_estimate': '1 day',
        'posted_language': 'en',
        'employer_verified': True,
    },
    # ══ MASONRY ══════════════════════════════════════════════════════════════
    {
        'job_id': 'job_029',
        'title': 'Block layer for new residential building — Ibadan',
        'description': (
            'New residential project in Ibadan Ring Road area needs experienced block layer. '
            'Minimum 500 blocks per day, clean mix required. Longer engagement for good work.'
        ),
        'category': 'masonry',
        'location_name': 'Ibadan — Ring Road',
        'budget_naira': 8500,
        'duration_estimate': '3 weeks',
        'posted_language': 'en',
        'employer_verified': False,
    },
    {
        'job_id': 'job_030',
        'title': 'Onye ọrụ carpentry achọrọ maka ụlọ ọhụrụ — Enugu',
        'description': (
            'Anyị chọrọ onye ọrụ siri ike na carpentry iji wuo oche ọrụ na shelf '
            'maka ụlọ ọrụ anyị ọhụrụ na Enugu GRA. Ọrụ ga-ewe izu 1. '
            'Onye nwere ihe ọsọ ọrụ ya ga-adị mma.'
        ),
        'category': 'carpentry',
        'location_name': 'Enugu GRA',
        'budget_naira': 9000,
        'duration_estimate': '1 week',
        'posted_language': 'ig',
        'employer_verified': False,
    },
    {
        'job_id': 'job_032',
        'title': 'Mo n wa painter fun apartment tuntun — Ibadan',
        'description': (
            'Mo n wa painter lati ṣe interior ati ceiling painting fun apartment tuntun. '
            'Emulsion ati gloss, iṣẹ kii yoo gba ju ọjọ mẹta lọ. Ibadan.'
        ),
        'category': 'painting',
        'location_name': 'Ibadan — Ring Road',
        'budget_naira': 6500,
        'duration_estimate': '3 days',
        'posted_language': 'yo',
        'employer_verified': False,
    },
]

# ─── Template-based job expansion (to reach 100 total) ────────────────────────

_JOB_TEMPLATES: list[dict] = [
    # Welding templates
    {'t': 'Welder needed for {item} in {loc}', 'd': 'Looking for experienced welder to {task} at a residential property in {loc}. Own machine required.', 'cat': 'welding', 'lang': 'en', 'budget': (10000, 16000)},
    {'t': 'Need welder for {item}', 'd': 'I need welder wey sabi {task}. Must bring own machine. Location: {loc}.', 'cat': 'welding', 'lang': 'pcm', 'budget': (9000, 14000)},
    # Electrical
    {'t': 'Electrician needed for {item} in {loc}', 'd': 'Seeking qualified electrician for {task}. Three-phase available. {loc}.', 'cat': 'electrical', 'lang': 'en', 'budget': (7000, 15000)},
    {'t': 'Electrician wey sabi {item}', 'd': 'I need electrician to help me {task}. Good pay for fast worker. {loc}.', 'cat': 'electrical', 'lang': 'pcm', 'budget': (6000, 12000)},
    # Generator repair
    {'t': 'Generator repair technician — {loc}', 'd': 'Our generator has been faulty. Need experienced diesel technician in {loc}.', 'cat': 'generator_repair', 'lang': 'en', 'budget': (8000, 12000)},
    {'t': 'Gen technician needed for {item}', 'd': 'My generator dey give me trouble, need technician wey sabi diesel gen. {loc}.', 'cat': 'generator_repair', 'lang': 'pcm', 'budget': (7000, 10000)},
    # Tailoring
    {'t': 'Tailor for {item} — {loc}', 'd': 'We need skilled tailor to {task}. Good material provided, deadline is firm. {loc}.', 'cat': 'tailoring', 'lang': 'en', 'budget': (5000, 9000)},
    {'t': 'Fashion designer wey sabi {item}', 'd': 'Need designer wey go {task} well. Location na {loc}. Fabric don ready.', 'cat': 'tailoring', 'lang': 'pcm', 'budget': (4000, 8000)},
    # Plumbing
    {'t': 'Plumber needed — {item} in {loc}', 'd': 'Plumbing issue at our property. Need experienced plumber to {task} in {loc}.', 'cat': 'plumbing', 'lang': 'en', 'budget': (7000, 12000)},
    {'t': 'Plumber for {item} for {loc}', 'd': 'I need plumber wey sabi {task}. Come with tools. {loc}.', 'cat': 'plumbing', 'lang': 'pcm', 'budget': (6000, 10000)},
    # Carpentry
    {'t': 'Carpenter for {item} — {loc}', 'd': 'Need skilled carpenter to {task} for us. Good pay. {loc}.', 'cat': 'carpentry', 'lang': 'en', 'budget': (7000, 13000)},
    {'t': 'Carpenter wey sabi {item}', 'd': 'I need carpenter to {task}. Material available. {loc}.', 'cat': 'carpentry', 'lang': 'pcm', 'budget': (6000, 11000)},
    # Painting
    {'t': 'Painter needed — {item} in {loc}', 'd': 'Looking for professional painter to {task}. Quality finish expected. {loc}.', 'cat': 'painting', 'lang': 'en', 'budget': (5000, 9000)},
    {'t': 'Painter wey sabi {item}', 'd': 'Need painter to {task}. Location: {loc}. No drips, neat work only.', 'cat': 'painting', 'lang': 'pcm', 'budget': (5000, 8000)},
    # Driving
    {'t': 'Driver needed — {loc}', 'd': 'Looking for reliable driver for {task}. Valid license required. {loc}.', 'cat': 'driving', 'lang': 'en', 'budget': (5000, 9000)},
    {'t': 'Driver wey know {loc} road', 'd': 'Need driver wey know {loc} very well to {task}. Good attitude compulsory.', 'cat': 'driving', 'lang': 'pcm', 'budget': (5000, 8000)},
    # Cleaning
    {'t': 'House cleaner needed — {loc}', 'd': 'Looking for reliable cleaner to handle {task}. Twice a week. {loc}.', 'cat': 'cleaning', 'lang': 'en', 'budget': (3000, 5000)},
    {'t': 'Need cleaner for {item}', 'd': 'I need cleaner wey go {task} for me. Lagos-based, {loc}.', 'cat': 'cleaning', 'lang': 'pcm', 'budget': (2500, 4500)},
    # Security
    {'t': 'Security guard needed — {loc}', 'd': 'Warehouse in {loc} needs vigilant security guard for night duty.', 'cat': 'security', 'lang': 'en', 'budget': (3500, 5500)},
    # Catering
    {'t': 'Cook needed for {item} — {loc}', 'd': 'Looking for experienced cook to prepare meals for {task}. {loc}.', 'cat': 'catering', 'lang': 'en', 'budget': (5000, 9000)},
    {'t': 'Chef wey sabi {item}', 'd': 'I need chef wey sabi {task} well well. {loc}. Come with your utensils.', 'cat': 'catering', 'lang': 'pcm', 'budget': (4000, 8000)},
    # Tiling
    {'t': 'Tiler needed — {loc}', 'd': 'Professional tiler required to tile {task}. Quality tiles provided. {loc}.', 'cat': 'tiling', 'lang': 'en', 'budget': (7000, 12000)},
    # Electronics
    {'t': 'Phone/electronics technician — {loc}', 'd': 'Repair shop needs tech for {task}. Must have own tools. {loc}.', 'cat': 'electronics_repair', 'lang': 'en', 'budget': (6000, 11000)},
    # AC
    {'t': 'AC technician for servicing — {loc}', 'd': 'Need HVAC tech to service {task}. Gas recharge may be needed. {loc}.', 'cat': 'hvac', 'lang': 'en', 'budget': (8000, 14000)},
    # Masonry
    {'t': 'Mason / block layer — {loc}', 'd': 'Construction project in {loc} needs experienced block layer. {task}.', 'cat': 'masonry', 'lang': 'en', 'budget': (6000, 10000)},
]

_TEMPLATE_PARAMS = {
    'welding':          {'item': ['gate fabrication', 'roofing steel', 'fence work', 'burglary proof'], 'task': ['fabricate security gate', 'weld roof trusses', 'install fence', 'repair burglary proof']},
    'electrical':       {'item': ['house wiring', 'shop wiring', 'inverter installation', 'solar setup'], 'task': ['wire a 3-bedroom flat', 'install solar system', 'set up inverter', 'wire commercial space']},
    'generator_repair': {'item': ['Mikano fault', 'Perkins overhaul', 'AVR replacement', 'starter problem'], 'task': ['diagnose and fix gen fault', 'overhaul diesel engine', 'replace AVR', 'fix starter motor']},
    'tailoring':        {'item': ['aso-ebi sewing', 'corporate uniforms', 'agbada and kaftan', 'party outfit'], 'task': ['sew 20 aso-ebi pieces', 'make 30 staff uniforms', 'sew native wear collection', 'design party attire']},
    'plumbing':         {'item': ['pipe repair', 'bathroom overhaul', 'drainage fix', 'tank installation'], 'task': ['fix burst pipe', 'renovate bathroom', 'unblock drainage', 'install overhead tank']},
    'carpentry':        {'item': ['furniture making', 'cabinet work', 'ceiling installation', 'door frames'], 'task': ['build office furniture', 'install kitchen cabinets', 'put up false ceiling', 'fix door frames']},
    'painting':         {'item': ['interior painting', 'exterior finish', 'texture work', 'POP painting'], 'task': ['paint 4-bedroom house', 'do exterior gloss', 'apply texture finish', 'paint POP ceiling']},
    'driving':          {'item': ['personal driver', 'dispatch rider', 'logistics driver'], 'task': ['drive personal vehicle', 'do delivery runs', 'move goods across Lagos']},
    'cleaning':         {'item': ['house cleaning', 'office cleaning', 'post-construction cleaning'], 'task': ['clean 3-bedroom apartment', 'handle office cleaning', 'do post-construction cleanup']},
    'security':         {'item': ['warehouse guard', 'estate security', 'night watchman'], 'task': ['guard warehouse overnight', 'patrol estate', 'watch compound']},
    'catering':         {'item': ['jollof and stew', 'small chops and catering', 'suya and grills', 'office canteen'], 'task': ['cook for 30 staff daily', 'cater for event of 200 people', 'run suya spot', 'prepare canteen meals']},
    'tiling':           {'item': ['floor tiles', 'wall and floor tiles', 'kitchen backsplash'], 'task': ['tile 4-bedroom house', 'tile bathrooms and kitchen', 'lay marble floors']},
    'electronics_repair': {'item': ['phone repairs', 'screen replacement', 'motherboard work'], 'task': ['handle phone repairs', 'fix screens and charging ports', 'do motherboard repairs']},
    'hvac':             {'item': ['AC servicing', 'split unit install', 'gas recharge'], 'task': ['service 5 split units', 'install 3 new ACs', 'do gas recharge and maintenance']},
    'masonry':          {'item': ['block laying', 'plastering', 'foundation work'], 'task': ['Minimum 400 blocks per day required', 'Plaster internal walls neatly', 'Lay foundation blocks for new building']},
}


def _generate_templated_jobs(n_extra: int, start_id: int, seed: int) -> list[dict]:
    rng_local = np.random.default_rng(seed)
    local_rand = _random.Random(seed)
    locations  = list(ALL_LOCATIONS.keys())
    jobs = []
    for i in range(n_extra):
        tmpl  = local_rand.choice(_JOB_TEMPLATES)
        cat   = tmpl['cat']
        loc   = local_rand.choice(locations)
        params = _TEMPLATE_PARAMS.get(cat, {})
        item  = local_rand.choice(params.get('item', ['general work']))
        task  = local_rand.choice(params.get('task', ['complete the work']))
        blo, bhi = tmpl['budget']
        budget = int(rng_local.integers(blo, bhi))
        jobs.append({
            'job_id':          f'job_{start_id + i:03d}',
            'title':           tmpl['t'].format(item=item, loc=loc),
            'description':     tmpl['d'].format(item=item, task=task, loc=loc),
            'category':        cat,
            'location_name':   loc,
            'budget_naira':    budget,
            'duration_estimate': local_rand.choice(['1 day', '2 days', '3 days', '1 week', '2 weeks', 'ongoing']),
            'posted_language': tmpl['lang'],
            'employer_verified': bool(rng_local.integers(0, 2)),
        })
    return jobs


def load_jobs() -> pd.DataFrame:
    """Return all job postings (handcrafted + template-generated) as a DataFrame."""
    n_extra  = max(0, 100 - len(JOBS_HANDCRAFTED))
    extra    = _generate_templated_jobs(n_extra, start_id=33, seed=SEED)
    all_jobs = JOBS_HANDCRAFTED + extra

    df = pd.DataFrame(all_jobs)
    df['location_lat'] = df['location_name'].map(lambda n: ALL_LOCATIONS.get(n, (6.5244, 3.3792))[0])
    df['location_lng'] = df['location_name'].map(lambda n: ALL_LOCATIONS.get(n, (6.5244, 3.3792))[1])

    # Fill schema fields missing from handcrafted records
    ref = datetime(2026, 5, 13, 12, 0, 0)
    rng_jobs = np.random.default_rng(SEED + 1)
    if 'employer_id' not in df.columns:
        df['employer_id'] = [f'emp_{i:04d}' for i in range(len(df))]
    if 'posted_at' not in df.columns:
        df['posted_at'] = [ref - timedelta(days=int(rng_jobs.integers(0, 14))) for _ in range(len(df))]

    return df.reset_index(drop=True)


# ─── Worker archetypes ────────────────────────────────────────────────────────

_ARCHETYPES: dict[str, dict] = {
    'welding':           {'skills': ['welding', 'fabrication', 'arc welding', 'mild steel', 'stainless steel', 'TIG welding'],         'rate': (8000, 18000),  'secondary_pool': ['electrical', 'masonry']},
    'generator_repair':  {'skills': ['generator repair', 'diesel engine', 'AVR', 'electrical', 'mechanical'],                          'rate': (7000, 15000),  'secondary_pool': ['electrical', 'hvac']},
    'electrical':        {'skills': ['electrical wiring', 'three-phase', 'conduit', 'solar installation', 'inverter setup'],           'rate': (7000, 18000),  'secondary_pool': ['generator_repair', 'hvac']},
    'tailoring':         {'skills': ['tailoring', 'fashion design', 'Ankara', 'aso-ebi', 'corporate wear', 'native wear'],             'rate': (4000, 10000),  'secondary_pool': ['cleaning']},
    'plumbing':          {'skills': ['plumbing', 'pipe fitting', 'drainage', 'emergency repair', 'overhead tank'],                     'rate': (6000, 14000),  'secondary_pool': ['masonry', 'tiling']},
    'carpentry':         {'skills': ['carpentry', 'furniture making', 'cabinet making', 'hardwood', 'wardrobe', 'ceiling'],             'rate': (7000, 14000),  'secondary_pool': ['painting', 'masonry']},
    'painting':          {'skills': ['painting', 'interior painting', 'exterior painting', 'POP ceiling', 'texture finish', 'emulsion'],'rate': (5000, 11000),  'secondary_pool': ['carpentry', 'masonry']},
    'tiling':            {'skills': ['tiling', 'floor tiles', 'wall tiles', 'grout', 'marble'],                                        'rate': (7000, 13000),  'secondary_pool': ['masonry', 'plumbing']},
    'cleaning':          {'skills': ['cleaning', 'housekeeping', 'laundry', 'domestic help', 'disinfection'],                          'rate': (2500, 5000),   'secondary_pool': ['catering']},
    'driving':           {'skills': ['driving', 'dispatch riding', 'chauffeur', 'logistics', 'truck driving'],                          'rate': (5000, 12000),  'secondary_pool': []},
    'security':          {'skills': ['security', 'surveillance', 'CCTV', 'access control', 'patrol'],                                  'rate': (3500, 6000),   'secondary_pool': ['driving']},
    'catering':          {'skills': ['cooking', 'catering', 'Nigerian cuisine', 'meal planning', 'suya', 'continental'],                'rate': (4500, 10000),  'secondary_pool': ['cleaning']},
    'electronics_repair':{'skills': ['phone repair', 'motherboard', 'software flashing', 'screen replacement', 'electronics'],          'rate': (6000, 12000),  'secondary_pool': ['electrical']},
    'hvac':              {'skills': ['AC repair', 'HVAC', 'refrigeration', 'gas recharge', 'split unit'],                              'rate': (8000, 16000),  'secondary_pool': ['electrical', 'generator_repair']},
    'masonry':           {'skills': ['block laying', 'masonry', 'plastering', 'concrete', 'bricklaying'],                              'rate': (6000, 11000),  'secondary_pool': ['carpentry', 'tiling']},
}

_BIOS: dict[str, list[str]] = {
    'welding':          ["Experienced welder with {y} years in gate fabrication and structural steel.", "I dey do welding since {yr}. Stainless, mild steel, aluminium — no wahala.", "Professional welder wey sabi TIG, MIG, and arc. Based in {city}."],
    'generator_repair': ["Generator and electrical technician, {y} years field experience. I repair all brands.", "I dey fix gen since {yr}. Mikano, FG Wilson, Perkins, Cummins — I sabi all.", "Certified diesel technician specialising in generator overhaul and AVR repair."],
    'electrical':       ["Licensed electrician with {y} years in residential and commercial wiring.", "Electrician wey sabi three-phase, solar system, inverter — everything electrical.", "Electrical contractor based in {city}. Clean work, no shortcuts."],
    'tailoring':        ["Professional tailor with {y} years in ladies and gents fashion.", "Fashion designer wey sabi Ankara, aso-ebi, corporate uniforms and agbada.", "Skilled tailor from {city}. Native wear, contemporary — I do all."],
    'plumbing':         ["Professional plumber, {y} years residential and commercial experience.", "Plumber wey sabi all kind pipe work — burst pipe, bathroom renovation, drainage.", "Experienced plumber in {city}. Fast response for emergencies."],
    'carpentry':        ["Carpenter specialising in furniture, wardrobes, and ceiling work. {y} years experience.", "Carpenter wey sabi furniture making — office desk, kitchen cabinet, wardrobe.", "Professional woodwork artisan based in {city}."],
    'painting':         ["House painter, {y} years. Interior, exterior, POP, texture finish.", "Painter wey sabi do am neat. No drips, no mess. Based in {city}.", "Professional painter: emulsion, gloss, texture, ceiling — all covered."],
    'tiling':           ["Professional tiler with {y} years. Italian tiles, Spanish tiles — all covered.", "Tiler wey do am clean. My work dey speak for itself.", "Experienced tiler specialising in luxury floor and wall tile finishes."],
    'cleaning':         ["Reliable house cleaner, {y} years residential and office experience.", "I dey do house cleaning, laundry, and domestic work. Very trustworthy.", "Professional cleaner and housekeeper. References available."],
    'driving':          ["Professional driver with {y} years. Valid license, clean record.", "Driver wey know every road for {city}. Punctual, professional, reliable.", "Experienced dispatch rider and delivery driver."],
    'security':         ["Security professional with {y} years in facility and warehouse security.", "Experienced security guard. Very vigilant, no sleeping on duty.", "Licensed security officer trained in surveillance and access control."],
    'catering':         ["Professional caterer, {y} years cooking Nigerian and continental dishes.", "Cook wey sabi everything — jollof, peppersoup, suya, fried rice. Come see my work.", "Experienced chef for corporate catering and events."],
    'electronics_repair':["Phone and electronics technician, {y} years. I fix all brands, all faults.", "Technician for phone repair — screen, motherboard, software — no wahala.", "Electronics repair specialist based in {city}. Fast turnaround guaranteed."],
    'hvac':             ["Certified HVAC technician, {y} years in AC installation and repair.", "AC technician wey sabi — gas recharge, compressor, all AC wahala.", "Refrigeration and air conditioning engineer. Own gauges and tools."],
    'masonry':          ["Block layer and mason, {y} years on residential and commercial sites.", "Mason wey know the work. Fast, neat, no wastage. Plenty estates for {city}.", "Professional bricklayer and plasterer. Strong work ethic."],
}

_NAMES = [
    'Adewale', 'Tunde', 'Biodun', 'Seun', 'Bayo', 'Kemi', 'Folake', 'Yemi', 'Rotimi',
    'Chukwuemeka', 'Ngozi', 'Emeka', 'Chioma', 'Ifeanyi', 'Ada', 'Obiora', 'Tochi', 'Amaka',
    'Abubakar', 'Ibrahim', 'Fatima', 'Maryam', 'Sani', 'Usman', 'Hauwa', 'Zainab', 'Lawal',
    'Emmanuel', 'David', 'Grace', 'Sunday', 'Monday', 'Lucky', 'Blessing', 'Faith', 'Prosper',
    'Oluwaseun', 'Adebayo', 'Funmilayo', 'Kehinde', 'Taiwo', 'Olumide', 'Shade', 'Adeola',
    'Chidi', 'Eze', 'Nkechi', 'Obinna', 'Ifeoma', 'Chinyere', 'Okonkwo', 'Obi', 'Ugochi',
    'Musa', 'Aliyu', 'Hadiza', 'Bashir', 'Saratu', 'Yakubu', 'Ramatu', 'Halima', 'Binta',
]


def generate_workers(n: int = 200, seed: int = SEED) -> pd.DataFrame:
    """
    Generate n worker profiles from Nigerian informal economy archetypes.

    20% of workers are cold-start (0 gigs, no rating, no KudiScore tier).
    Workers are concentrated in Lagos (~60%) with realistic neighbourhood geography.
    """
    rng_local  = np.random.default_rng(seed)
    rand_local = _random.Random(seed)

    categories   = list(_ARCHETYPES.keys())
    n_cold_start = int(n * 0.20)
    ref_date     = datetime(2026, 5, 13, 12, 0, 0)

    rows = []
    for i in range(n):
        cat  = categories[i % len(categories)]
        arch = _ARCHETYPES[cat]

        # Location — Lagos-heavy
        if rand_local.random() < _LAGOS_WEIGHT:
            location_name = rand_local.choice(_LAGOS_HOODS)
        else:
            location_name = rand_local.choice(_OTHER_LOCS)

        base_lat, base_lng = ALL_LOCATIONS[location_name]
        lat = base_lat + rng_local.uniform(-0.02, 0.02)
        lng = base_lng + rng_local.uniform(-0.02, 0.02)

        years      = int(rng_local.integers(2, 15))
        rate_lo, rate_hi = arch['rate']
        daily_rate = int(rng_local.integers(rate_lo, rate_hi))

        # Skills
        all_skills = arch['skills']
        n_skills   = int(rng_local.integers(2, min(5, len(all_skills)) + 1))
        skills     = [str(s) for s in rng_local.choice(all_skills, size=n_skills, replace=False)]

        # Secondary categories — random 0/1/2 skills from the pool (genuine variance)
        sec_pool = arch.get('secondary_pool', [])
        n_sec = rand_local.choice([0, 1, 2]) if sec_pool else 0
        secondary_categories = rand_local.sample(sec_pool, min(n_sec, len(sec_pool)))

        # Cold-start vs established
        is_cold_start = i < n_cold_start
        if is_cold_start:
            completed_gigs  = 0
            avg_rating      = None
            completion_rate = None
            kudiscore_tier  = None
        else:
            completed_gigs  = int(rng_local.integers(5, 200))
            avg_rating      = round(float(np.clip(rng_local.normal(4.1, 0.5), 1.0, 5.0)), 2)
            completion_rate = round(float(np.clip(rng_local.normal(0.85, 0.10), 0.40, 1.00)), 3)
            kudiscore_tier  = rand_local.choices(['bronze', 'silver', 'gold'], weights=[0.45, 0.40, 0.15])[0]

        bio_tmpl = rand_local.choice(_BIOS[cat])
        bio = bio_tmpl.format(y=years, yr=2026 - years, city=location_name)

        last_active_days = int(rng_local.integers(0, 30))
        service_radius   = rand_local.choice([5, 10, 20, 30, 50])
        bvn_verified     = bool(rng_local.integers(0, 2))

        rows.append({
            'worker_id':             f'w_{i:04d}',
            'name':                  rand_local.choice(_NAMES),
            'primary_category':      cat,
            'secondary_categories':  secondary_categories,
            'bio':                   bio,
            'skills':                skills,
            'location_name':         location_name,
            'location_lat':          round(lat, 5),
            'location_lng':          round(lng, 5),
            'service_radius_km':     service_radius,
            'daily_rate_naira':      daily_rate,
            'completed_gigs':        completed_gigs,
            'avg_rating':            avg_rating,
            'completion_rate':       completion_rate,
            'kudiscore_tier':        kudiscore_tier,
            'bvn_verified':          bvn_verified,
            'days_since_last_active': last_active_days,
            'last_active_at':        ref_date - timedelta(days=last_active_days),
        })

    return pd.DataFrame(rows)


# ─── Eval cases ────────────────────────────────────────────────────────────

EVAL_CASES = [
    {
        'name': 'Happy path — welder near Lekki',
        'job_id': 'job_001',
        'description': 'Welder in Lekki Phase 1, ₦15k/day. Top-5 should be welders near Lekki, rate ≤ ₦15k, high completion.',
    },
    {
        'name': 'Multilingual retrieval — Pidgin generator post',
        'job_id': 'job_006',
        'description': 'Pidgin post about a faulty generator in Yaba. Top-5 should be generator/electrical workers near Yaba — even if their bios are in English.',
    },
    {
        'name': 'Rate + geography reranking — domestic worker Lekki',
        'job_id': 'job_019',
        'description': 'Full-time domestic worker in Lekki, ₦80k/month (≈₦3,600/day). Rate cap is tight — workers asking more should rank below lower-rated but cheaper ones.',
    },
]


def save_to_json(output_dir: str = 'data') -> None:
    """Generate and persist jobs.json and workers.json for deterministic demo use."""
    out = Path(output_dir)
    out.mkdir(exist_ok=True)

    jobs = load_jobs()
    workers = generate_workers(n=200)

    # datetime → ISO string for JSON serialisation
    workers_serialisable = workers.copy()
    workers_serialisable['last_active_at'] = workers_serialisable['last_active_at'].dt.strftime('%Y-%m-%dT%H:%M:%S')

    jobs.to_json(out / 'jobs.json', orient='records', indent=2)
    workers_serialisable.to_json(out / 'workers.json', orient='records', indent=2)
    with open(out / 'eval_cases.json', 'w') as f:
        json.dump(EVAL_CASES, f, indent=2)

    print(f"Saved {len(jobs)} jobs, {len(workers)} workers to {out}/")
    print(f"Cold-start workers: {(workers['kudiscore_tier'].isna()).sum()}")


if __name__ == '__main__':
    save_to_json()
