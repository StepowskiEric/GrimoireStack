# Chain-of-Thought Pruning: Pattern Reference

This document catalogs concrete before/after pruning examples across three reasoning
types. Each entry shows a verbose draft chain, the pruned result, and the measured
compression ratio (raw tokens, approximate).

---

## 1 · Math Reasoning

### Before — 12 steps, ~380 tokens

```
Step 1: The problem says a train travels 120 km in 2 hours. I need to find its speed.
Step 2: Speed is distance divided by time. That's the formula: speed = distance / time.
Step 3: The distance is 120 km. The time is 2 hours. Let me plug those in.
Step 4: So speed = 120 km / 2 h = 60 km/h.
Step 5: Wait, let me double-check the units. Distance is in km, time is in hours, so
        the result will be km/h. That makes sense.
Step 6: Let me also verify: if it goes 60 km each hour for 2 hours, that's 60+60=120 km.
        Yes, that matches the given distance.
Step 7: But the problem also mentions a second leg of the journey — 80 km in 1 hour.
        I need to check if that's relevant.
Step 8: Reading again: "A train travels 120 km in 2 hours, then 80 km in 1 hour.
        What is the average speed for the entire trip?" Ah, it's asking for average
        speed over both legs, not just the first one.
Step 9: Average speed = total distance / total time. Total distance = 120 + 80 = 200 km.
        Total time = 2 + 1 = 3 hours.
Step 10: So average speed = 200 km / 3 h = 66.666... km/h. I'll round to 66.7 km/h.
Step 11: Let me verify once more: if the train went 66.7 km/h for 3 hours, that's about
         200 km total. That checks out.
Step 12: Therefore, the average speed for the entire trip is 66.7 km/h.
```

### After — 4 steps, ~72 tokens

```
1. Find average speed = total distance / total time.
2. Total distance = 120 + 80 = 200 km; total time = 2 + 1 = 3 h.
3. Avg speed = 200 / 3 = 66.7 km/h.
4. ∴ 66.7 km/h
```

### Compression ratio: **5.3×** (380 → 72 tokens)

**What was dropped:**
- Steps 1–4: restated formula without contributing new information; merged into Step 1.
- Step 5: unit check — correct but unnecessary once the formula is trusted.
- Step 6: back-calculation verification — redundant after computing the result.
- Step 7: re-reading the problem — dead end that contributed nothing (the re-read merged
  into the realized correction in Step 8).
- Steps 10–11: second verification pass — already covered by Step 3's arithmetic.

---

## 2 · Debugging

### Before — 10 steps, ~410 tokens

```
Step 1: The user reports that clicking the "Submit" button in the survey form doesn't
        do anything. No console errors appear.
Step 2: Let me first check the HTML to see how the button is wired up.
Step 3: In index.html, the button has `onclick="submitForm()"`. The function submitForm
        is defined in form.js. That looks fine.
Step 4: I should check form.js next.
Step 5: Opening form.js... I see submitForm calls e.preventDefault() and then calls
        submitToAPI(). Let me look at submitToAPI.
Step 6: submitToAPI is defined in api.js. Let me open that.
Step 7: In api.js, submitToAPI constructs a POST request. Wait, I see it uses
        `fetch(url, { method: 'POST', body: data })` — but it doesn't set
        Content-Type: application/json. That could be the issue.
Step 8: Actually, let me check the network tab to see if the request is even being sent.
        If the request isn't sent, the problem is earlier in the chain.
Step 9: The network tab shows no requests at all when I click Submit. So the request
        isn't even being made. The bug is before the fetch call.
Step 10: Back in form.js, I see submitForm has `if (!formIsValid) return;`. The formIsValid
         flag is always false because the validation function checks for a `name` field
         that was renamed to `fullName` last week. That's the bug — the validation
         is checking a field that no longer exists.
Step 11: The fix is to update formIsValid to check `fullName` instead of `name`.
```

### After — 4 steps, ~95 tokens

```
1. Symptom: Submit button silent — no network request, no console error.
2. Root: formIsValid always false; validation checks `name` field (renamed to `fullName`).
3. Fix: update formIsValid check to use `fullName`.
4. Verify: network tab shows POST on Submit click; form submits successfully.
```

### Compression ratio: **4.3×** (410 → 95 tokens)

**What was dropped:**
- Steps 2–6: file-hop exploration — once the validation guard was found (Step 10/11),
  earlier file exploration is redundant.
- Step 8: intermediate network-check hypothesis — confirmed unnecessary by Step 9.
- Step 10: the original long-form Step 10+11 got split and compressed; the dead-end
  Content-Type suspicion (Step 7) was dropped since the network tab proved the request
  never left the client.
- Remaining steps retain: symptom, root cause, fix, and verification — the four
  irreplaceable components.

---

## 3 · Planning

### Before — 9 steps, ~460 tokens

```
Step 1: I need to plan a 4-day trip to Tokyo for a client visiting in late October.
        Let me think about what to include.
Step 2: First, flights. The client flies from New York (JFK). I should check both
        JFK→NRT (Narita) and JFK→HND (Haneda) options. Haneda is closer to downtown
        Tokyo, so that's probably better.
Step 3: Accommodation: the client prefers boutique hotels in the Shibuya area.
        I should find a hotel within walking distance of Shibuya Station.
Step 4: For Day 1 (arrival day), the client lands in the afternoon. They'll be jet-lagged.
        I should keep it light — maybe check-in, evening walk around Shibuya Crossing,
        and a casual dinner nearby.
Step 5: Day 2: I was thinking of sending them to Tsukiji Outer Market for breakfast,
        then the team office for a 2-hour meeting, then maybe the Mori Art Museum in
        the afternoon. But wait, the team office is in Shibuya, and Mori Art Museum
        is in Roppongi — those are quite far apart. I should re-route.
Step 6: Actually, Mori Art Museum is a good half-day trip on its own. Let me move it
        to Day 3 instead, and keep Day 2 focused on the office visit and nearby
        activities in Shibuya.
Step 7: Day 3: Team meeting is in the morning now. Afternoon: Mori Art Museum in
        Roppongi. Evening: team dinner. That works.
Step 8: Day 4: Departure morning — airport shuttle. Keep it simple, no activities.
Step 9: I also need to book a Suica card and pocket Wi-Fi for the client. Those should
        be added to the pre-trip checklist.
Step 10: Summary: Flight JFK→HND, Shibuya boutique hotel, Suica + pocket Wi-Fi pre-booked.
         Day 1: light evening. Day 2: Tsukiji + office. Day 3: office + Mori Art + dinner.
         Day 4: depart.
```

### After — 6 steps, ~115 tokens

```
1. JFK→HND (closer to downtown); Shibuya boutique hotel.
2. Pre-book: Suica card, pocket Wi-Fi.
3. Day 1 (arrival PM): hotel check-in → Shibuya walk → nearby dinner.
4. Day 2: Tsukiji breakfast → office meeting (PM light/re-route if needed).
5. Day 3: office AM → Mori Art Museum PM → team dinner evening.
6. Day 4: airport shuttle, depart.
```

### Compression ratio: **4.0×** (460 → 115 tokens)

**What was dropped:**
- Step 2's JFK→NRT vs JFK→HND comparison: HND was selected; the abandoned route is
  irrelevant once the decision is recorded as "JFK→HND."
- Step 5's abandoned Day 2 Roppongi routing and its correction in Step 6: the dead-end
  itinerary was dropped; the correction (Mori → Day 3) was merged into the final Day 3
  entry.
- Step 10's summary was folded into the individual day entries, eliminating the
  standalone recap.

---

## Compression Ratio Summary

| Reasoning Type | Before (tokens) | After (tokens) | Ratio  | Notes                              |
|----------------|-----------------|----------------|--------|------------------------------------|
| Math           | ~380            | ~72            | 5.3×   | Heavy verbal justification dropped |
| Debugging      | ~410            | ~95            | 4.3×   | File-hop dead ends eliminated      |
| Planning       | ~460            | ~115           | 4.0×   | Abandoned routes merged/folded     |

**Key insight:** The highest compression ratio occurs in math, where formulaic reasoning
contains the most self-evident justifications ("let me verify," "that makes sense") that
do not survive pruning without loss of meaning. Debugging and planning retain more
context because each step encodes a decision that must be defensible to a future reader
(the reader may re-open the thread days later).
