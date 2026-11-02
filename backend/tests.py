from django.test import Client, TestCase

from .models import User


class AuthTests(TestCase):
    def setUp(self):
        User.objects.create_user("stu1", password="pass12345", role="student")
        self.c = Client(enforce_csrf_checks=True)

    def _token(self):
        return self.c.get("/api/auth/csrf/").json()["csrfToken"]

    def _login(self, u, p, token=None):
        return self.c.post(
            "/api/auth/login/",
            data={"username": u, "password": p},
            content_type="application/json",
            HTTP_X_CSRFTOKEN=token or "",
        )

    def test_login_without_csrf_rejected(self):
        self._token()
        self.assertEqual(self._login("stu1", "pass12345").status_code, 403)

    def test_login_ok_and_me(self):
        r = self._login("stu1", "pass12345", self._token())
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()["role"], "student")
        self.assertEqual(self.c.get("/api/auth/me/").json()["username"], "stu1")

    def test_bad_password(self):
        r = self._login("stu1", "wrong", self._token())
        self.assertEqual(r.status_code, 401)
        self.assertEqual(r.json()["code"], "invalid_credentials")

    def test_missing_fields(self):
        r = self._login("", "", self._token())
        self.assertEqual(r.status_code, 400)
        self.assertIn("username", r.json()["fields"])

    def test_logout(self):
        t = self._token()
        self._login("stu1", "pass12345", t)
        t = self._token()
        r = self.c.post("/api/auth/logout/", HTTP_X_CSRFTOKEN=t)
        self.assertEqual(r.status_code, 200)
        self.assertEqual(self.c.get("/api/auth/me/").status_code, 401)


class ProfileTests(TestCase):
    def setUp(self):
        User.objects.create_user("stu1", password="pass12345", role="student", usn="PES1UG24CS001")
        User.objects.create_user("war1", password="pass12345", role="warden")
        self.c = Client(enforce_csrf_checks=True)

    def _login(self, u):
        t = self.c.get("/api/auth/csrf/").json()["csrfToken"]
        self.c.post("/api/auth/login/", data={"username": u, "password": "pass12345"},
                    content_type="application/json", HTTP_X_CSRFTOKEN=t)
        return self.c.get("/api/auth/csrf/").json()["csrfToken"]

    def _patch(self, body, t):
        return self.c.patch("/api/auth/profile/", data=body, content_type="application/json",
                            HTTP_X_CSRFTOKEN=t)

    def test_requires_login(self):
        self.assertEqual(self.c.get("/api/auth/profile/").status_code, 401)

    def test_student_view(self):
        self._login("stu1")
        self.assertEqual(self.c.get("/api/auth/profile/").json()["usn"], "PES1UG24CS001")

    def test_non_student_forbidden(self):
        self._login("war1")
        self.assertEqual(self.c.get("/api/auth/profile/").status_code, 403)

    def test_phone_update(self):
        t = self._login("stu1")
        r = self._patch({"phone": "9876543210"}, t)
        self.assertEqual(r.status_code, 200)
        self.assertEqual(User.objects.get(username="stu1").phone, "9876543210")

    def test_other_fields_rejected(self):
        t = self._login("stu1")
        r = self._patch({"phone": "9876543210", "usn": "HACK"}, t)
        self.assertEqual(r.status_code, 400)
        self.assertEqual(User.objects.get(username="stu1").usn, "PES1UG24CS001")

    def test_bad_phone(self):
        t = self._login("stu1")
        self.assertEqual(self._patch({"phone": "abc"}, t).status_code, 400)

    def test_patch_without_csrf(self):
        self._login("stu1")
        self.assertEqual(self._patch({"phone": "9876543210"}, "").status_code, 403)
