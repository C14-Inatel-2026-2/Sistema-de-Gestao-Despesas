import importlib.util
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('deploy_vercel', Path(__file__).parents[1] / 'deploy_vercel.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
SHA = 'a' * 40
PROJECT = {'id': 'prj_test', 'name': 'despesas', 'link': {'type': 'github', 'repoId': 123}}
READY = {'id': 'dpl_test', 'url': 'despesas.vercel.app', 'readyState': 'READY',
         'aliasAssigned': True, 'gitSource': {'sha': SHA}}


class DeployTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        before = os.getcwd()
        os.chdir(self.temp.name)
        self.addCleanup(os.chdir, before)
        env = patch.dict(os.environ, SOURCE_COMMIT=SHA, VERCEL_PROJECT_ID='prj_test')
        env.start()
        self.addCleanup(env.stop)

    def test_success_pins_commit_and_records_evidence(self):
        with patch.object(module, 'request', side_effect=[PROJECT, {'id': 'dpl_test'}, READY]) as api:
            module.deploy()
        payload = api.call_args_list[1].args[1]
        self.assertEqual(payload['gitSource']['sha'], SHA)
        self.assertEqual(payload['gitSource']['ref'], SHA)
        self.assertEqual(payload['target'], 'production')
        self.assertTrue(Path('reports/vercel-deploy.json').exists())

    def test_error_and_canceled_fail_without_success_report(self):
        for state in ['ERROR', 'CANCELED']:
            with self.subTest(state=state), patch.object(module, 'request', side_effect=[PROJECT, {'id': 'dpl_test'}, {'readyState': state}]):
                with self.assertRaises(RuntimeError):
                    module.deploy()
                self.assertFalse(Path('reports/vercel-deploy.json').exists())

    def test_wrong_commit_fails(self):
        ready = {**READY, 'gitSource': {'sha': 'b' * 40}}
        with patch.object(module, 'request', side_effect=[PROJECT, {'id': 'dpl_test'}, ready]):
            with self.assertRaisesRegex(RuntimeError, 'SHA'):
                module.deploy()

    def test_waits_for_alias(self):
        pending = {**READY, 'aliasAssigned': False}
        with patch.object(module, 'time') as clock, patch.object(module, 'request', side_effect=[PROJECT, {'id': 'dpl_test'}, pending, READY]):
            clock.monotonic.return_value = 0
            module.deploy()
            clock.sleep.assert_called_once_with(10)

    def test_timeout_fails(self):
        with patch.object(module, 'time') as clock, patch.object(module, 'request', side_effect=[PROJECT, {'id': 'dpl_test'}, {'readyState': 'BUILDING'}]):
            clock.monotonic.side_effect = [0, 901]
            with self.assertRaises(TimeoutError):
                module.deploy()

    def test_invalid_sha_never_calls_vercel(self):
        with patch.dict(os.environ, SOURCE_COMMIT='main'), patch.object(module, 'request') as api:
            with self.assertRaises(ValueError):
                module.deploy()
            api.assert_not_called()
