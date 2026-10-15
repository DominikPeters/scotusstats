import unittest,copy
from stats_core import argument_stats,apply_alignment,validate_coding
class StatisticsTests(unittest.TestCase):
 def fixture(self):
  a={'name':'Jane Doe','identifier':'jane','kind':'advocate','role':'for petitioner'};j={'name':'Justice Kagan','last_name':'Kagan','kind':'justice'}
  return {'recording_id':'one','term':'2026','docket':'25-1','argument_date':'2026-10-05','case_name':'Case','audio':{'duration_seconds':30},'sections':[{'start':0,'stop':30,'turns':[{'start':0,'stop':10,'speaker':a,'text_blocks':[{'text':'One two three'}]},{'start':10,'stop':20,'speaker':j,'text_blocks':[{'text':'A question'}]},{'start':20,'stop':30,'speaker':a,'text_blocks':[{'text':'The answer'}]}]}]}
 def test_speech_excludes_questions_lectern_includes_them(self):
  s=argument_stats(self.fixture());self.assertEqual(s['argumentTime'][0][2],20);self.assertEqual(s['argumentTimeAtLectern'][0][2],30);self.assertEqual(s['wordsSpoken']['Kagan'],[2,0,0])
 def test_revisions_do_not_double_count_but_rearguments_do(self):
  r=self.fixture();entry={k:r[k] for k in ['recording_id','term','docket','argument_date']}|{'revision':'a','url':'https://example.test'};data={};apply_alignment(data,entry,r);entry['revision']='b';apply_alignment(data,entry,r);self.assertEqual(data['2026/25-1']['oralArgumentInfo']['overallLength'],30)
  r['recording_id']='two';entry['recording_id']='two';apply_alignment(data,entry,r);self.assertEqual(data['2026/25-1']['oralArgumentInfo']['overallLength'],60)
 def test_conflicting_votes_rejected(self):
  with self.assertRaises(ValueError):validate_coding({'decision':{'majorityVoters':['Kagan'],'minorityVoters':['Kagan']}},{},{})
if __name__=='__main__':unittest.main()
