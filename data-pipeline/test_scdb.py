import json,sys,subprocess,tempfile,unittest
from pathlib import Path

class ScdbTests(unittest.TestCase):
    def test_real_unanimous_case_has_nine_voters(self):
        root=Path(__file__).resolve().parent
        with tempfile.TemporaryDirectory() as folder:
            base=Path(folder);pipeline=base/'pipeline';pipeline.mkdir();(pipeline/'scdb').symlink_to(root/'scdb',target_is_directory=True)
            (pipeline/'scdb-decisions.py').write_text((root/'scdb-decisions.py').read_text())
            data=base/'data'/'2024';data.mkdir(parents=True);case=data/'23-1201.json';case.write_text('{}')
            subprocess.run([sys.executable,'scdb-decisions.py'],cwd=pipeline,check=True,capture_output=True,text=True)
            result=json.loads(case.read_text())['decision']
            self.assertEqual(result['majoritySize'],9)
            self.assertEqual(len(set(result['majorityVoters'])),9)
            self.assertEqual(len(set(result['majorityJoiners'])),9)
            self.assertIn(result['majorityWriter'],result['majorityVoters'])
            self.assertEqual(result['minorityVoters'],[])

if __name__=='__main__':unittest.main()
