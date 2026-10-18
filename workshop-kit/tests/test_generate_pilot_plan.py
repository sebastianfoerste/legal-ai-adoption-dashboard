"""Tests for the frequency parsing in scripts/generate_pilot_plan.py. Pure stdlib unittest."""

import unittest

from generate_pilot_plan import parse_frequency


class ParseFrequencyTest(unittest.TestCase):
    def assertPerWeek(self, frequency, expected):
        self.assertEqual(parse_frequency(frequency), expected, frequency)

    def test_daily_without_a_count_is_one_per_working_day(self):
        self.assertPerWeek("daily", 5.0)
        self.assertPerWeek("Daily", 5.0)
        self.assertPerWeek("everyday", 5.0)

    def test_count_per_day_is_multiplied_by_five(self):
        self.assertPerWeek("2 per day", 10.0)
        self.assertPerWeek("2 every working day", 10.0)

    def test_count_per_workday_is_multiplied_by_five(self):
        self.assertPerWeek("2 per workday", 10.0)

    def test_count_per_weekday_is_multiplied_by_five(self):
        self.assertPerWeek("2 per weekday", 10.0)

    def test_count_per_week_is_used_as_is(self):
        self.assertPerWeek("3-4 per week", 3.5)
        self.assertPerWeek("10-15 per week", 12.5)

    def test_count_in_words(self):
        self.assertPerWeek("twice daily", 10.0)
        self.assertPerWeek("once or twice a day", 7.5)
        self.assertPerWeek("two per week", 2.0)

    def test_weekday_names_are_not_daily(self):
        self.assertPerWeek("1 every Monday", 1.0)

    def test_text_without_a_count_is_zero(self):
        self.assertPerWeek("ad hoc", 0.0)
        self.assertPerWeek("one-off", 0.0)
        self.assertPerWeek("", 0.0)


if __name__ == "__main__":
    unittest.main()
