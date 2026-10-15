import json,sys,subprocess,tempfile,unittest
from pathlib import Path
from datetime import datetime
from unittest.mock import patch,Mock
from court_cache import NegativeCache,current_term,fetch_document

class CacheTests(unittest.TestCase):
    def test_historical_misses_and_explicit_refresh(self):
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'404.list.txt';path.write_text(' 13-433 \n13-433\n')
            cache=NegativeCache(path)
            self.assertTrue(cache.skip('13-433','2014'))
            self.assertFalse(cache.skip('13-433','2014',True))
            cache.missing('13-433');self.assertEqual(path.read_text(),'13-433\n')
            cache.found('13-433');self.assertEqual(path.read_text(),'')
    def test_current_term_misses_retry_daily(self):
        with tempfile.TemporaryDirectory() as folder:
            cache=NegativeCache(Path(folder)/'404.list.txt')
            with patch('court_cache.time.time',return_value=100000):cache.missing('25-100')
            with patch('court_cache.time.time',return_value=100060):self.assertTrue(cache.skip('25-100',current_term()))
            with patch('court_cache.time.time',return_value=200000):self.assertFalse(cache.skip('25-100',current_term()))
    def test_term_boundary(self):
        self.assertEqual(current_term(datetime(2026,9,30)),'2025')
        self.assertEqual(current_term(datetime(2026,10,1)),'2026')
    def test_only_confirmed_missing_responses_are_negative(self):
        import requests
        for status in [404,410]:
            with patch('requests.get',return_value=Mock(status_code=status)):self.assertIsNone(fetch_document('https://example.test'))
        for status in [403,429,500,503]:
            response=Mock(status_code=status);response.raise_for_status.side_effect=requests.HTTPError(str(status))
            with patch('requests.get',return_value=response),self.assertRaises(requests.HTTPError):fetch_document('https://example.test')
        with patch('requests.get',side_effect=requests.Timeout()),self.assertRaises(requests.Timeout):fetch_document('https://example.test')
        with patch('requests.get',return_value=Mock(status_code=200,content=b'ERROR: File or directory not found')):self.assertIsNone(fetch_document('https://example.test'))

if __name__=='__main__':unittest.main()
